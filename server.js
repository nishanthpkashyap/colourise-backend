const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const app = express();
const multer = require("multer");
const colourising_path = "C:/Users/nisha/Downloads/python projects/python_colourise";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = '';
    if (file.mimetype.startsWith('image/')) 
    {
      dest = `${colourising_path}/test_images/`;
    } 
    else if (file.mimetype.startsWith('video/')) 
    {
      dest = `${colourising_path}/test_video/`;
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});


app.use('/styles.css', express.static(__dirname + '/styles.css'));
app.use('/main.js', express.static(__dirname + '/main.js'));
app.use(express.json());
app.use(cors({
  origin: '*'
}));
app.use(express.urlencoded({ extended: false }));

const upload = multer({ storage});

app.post("/colourise", upload.single("file"), async (req, res) => {
  let result_folder, endPoint;
  console.log("\n\nReq.file", req.file)
  const { mimetype, originalname, size } = req.file;
  // const mimetype = type;
  // const originalname = name;
  console.log("mime: " + mimetype);

  if (mimetype.startsWith("image")) 
  {
    console.log("Image called");
    endPoint = "colouriseImage";
    result_folder = "result_images";
  } 
  
  else if (mimetype.startsWith("video")) 
  {
    console.log("Video called");
    endPoint = "colouriseVideo";
    result_folder = "result_video";
  } 
  
  else 
  {
    res.send("Wrong file type: " + mimetype);
  }

  let response = await axios.get(`http://localhost:6500/${endPoint}`, {params: {file: originalname}})
  console.log("response: " + response.data + " " + response.status)
  if(response.data == "success" & response.status == 200) {
    path = `${colourising_path}/${result_folder}/${originalname}`;
    console.log(path, "\npath");

    const fileExists = fs.existsSync(path);
    if(fileExists)
    {
      console.log("about to call res.download")
      res.send(path);
    }
    else {
      res.send("OOPS!!!")
    }
  }
  else
  {
    res.send(response.data);
  }
});

app.get('/file', async function(req, res)
{
  const path = req.query.filePath;
  res.download(path);
})

app.get('/simple', async function (req, res) 
{
  let response = await axios.get("http://localhost:6500/hello")
  console.log(response.error)
  res.send(response.data)
})


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(5500, () => {
  console.log("Server started on port 5500");
});
