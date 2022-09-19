const express = require("express");
const multer = require("multer");
const path = require('path');
// const { create } = require("../models/post");

const Post = require("../models/post"); // uppoercase to indicate new object based on some blueprint

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      word: req.body.word,
      definition: req.body.definition,
      partOfSpeech: req.body.partOfSpeech,
      use: req.body.use,
      imagePath: url + "/images/" + req.file.filename // this is still undefined
    });
    // console.log(post.imagePath);
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    });
  }
);

router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    };
  const post = new Post({
    _id: req.body.id,
    word: req.body.word,
    definition: req.body.definition,
    partOfSpeech: req.body.partOfSpeech,
    use: req.body.use,
    imagePath: imagePath
  });
  console.log(post);
  Post.updateOne({ _id: req.params.id }, post).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Update successful!" });
  });
});

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.then((docs) => {
    fetchedPosts = docs;
    return Post.count();
    // res.status(200).json({
    //   // want to wait for the async function to finish in the callback
    //   message: "Posts fetched successfully!",
    //   posts: docs, // these will be js objects with different id field -- we want to convert this in the service
    // });
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

router.delete("/:id", (req, res, next) => {
  // :dynamicallyPassedParameter
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});


module.exports = router;



// const imageStorage = multer.diskStorage({
//   // Destination to store image
//   destination: 'backend/images',
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()
//            + path.extname(file.originalname))
//           // file.fieldname is name of the field (image)
//           // path.extname get the uploaded file extension
//   }
// });

// const imageUpload = multer({
//   storage: imageStorage,
//   limits: {
//     fileSize: 100000000 // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// })

// // For Single image upload
// router.post('/uploadImage', imageUpload.single('image'), (req, res) => {
//   res.send(req.file)
// }, (error, req, res, next) => {
//   res.status(400).send({ error: error.message })
// })
