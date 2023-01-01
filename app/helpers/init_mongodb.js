
"use strict";
const db = require("../models");
const Role = db.role;
const contentType = db.tenant.contentType;
const deliveryType = db.tenant.deliveryType;
const mongoose = require('mongoose')

module.exports = (cfg, data) => {

  mongoose.connect(cfg.db.mongo.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("mongodb connected")
    initial();
  })
    .catch((err) => console.log(err.message))
}

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "super_admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'super_admin' to roles collection");
      });
    }
  });

  contentType.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new contentType({
        name: "PDF",
        code: "pdf",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'pdf' to contenttype collection");
      });

      new contentType({
        name: "IMAGE",
        code: "image",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'image' to contentype collection");
      });

    }
  });
  deliveryType.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new deliveryType({
        name: "PROFILE PIC",
        code: "profile_pic",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'profile_pic' to contenttype collection");
      });

      new deliveryType({
        name: "IDENTITY",
        code: "identity",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'identity' to contentype collection");
      });

      new deliveryType({
        name: "MESSAGE ASSET",
        code: "message_asset",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'message_asset' to contentype collection");
      });

      new deliveryType({
        name: "BUILDING ASSET",
        code: "building_asset",
        is_active : true
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'building_asset' to contentype collection");
      });

    }
  });
}