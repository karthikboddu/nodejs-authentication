const db = require('../../models')
const userNotes = db.tenant.userNotes;


exports.create = (req, res) => {
  try {
      
    if (!req.body.title) {
        res.status(400).send({ message: "Content cannot be empty " });
    }
    
    const userNotesObject = new userNotes({
        tenant_id : req.userId,
        title: req.body.title,
        description: req.body.description,
        color_code: req.body.colorCode,
        parent_id : req.parentId
    });


    userNotesObject
        .save(userNotesObject)
        .then(result => {
            res.send({status : 200, data : result});
        })
        .catch(err => {
            console.log(err)
        res.status(500).send({
            status : 500,
            message: err.message || "Some error occurred while creating the notes."
        });
        });
    } catch (error) {
        console.log(error)
        return res.send(error);
    }

};

exports.findAll = (req, res) => {

  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } 
  , tenant_id : req.userId, parent_id : req.parentId, is_active: true } : {tenant_id : req.userId, parent_id : req.parentId, is_active: true};

  let { page, size } = req.query;
  if (!page) {
    page = 1;
  }
  if (!size) {
    size = 100;
  }
  const limit = parseInt(size);
  const skip = (page - 1) * size;

  userNotes.find(condition)
  .limit(limit).skip(skip).sort({ updated_at: -1 })
    .then(result => {
      res.send({status : 200, data : result});
    })
    .catch(err => {
      res.status(500).send({
        status : 500,
        message:
          err.message || "Some error occurred while retrieving notes."
      });
    });
};

exports.findOne = (req, res) => {

  const id = req.params.id;

  userNotes.findById(id)
    .then(result => {
      if (!result)
        res.status(404).send({ message: "Not found Notes with id " + id });
      else res.send({status : 200, data : result});
    })
    .catch(err => {
      res
        .status(500)
        .send({ status : 500, message: "Error retrieving Notes with id=" + id + err });
    });


};

exports.update = (req, res) => {


  if (!req.body) {
    return res.status(400).send({
        status: 400,
        message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  userNotes.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
            status: 400,
            message: `Cannot update Note with id=${id}. Maybe Note was not found!`
        });
      } else res.send({ status: 200,message: "Note was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        status: 500,
        message: "Error updating Note with id=" + id
      });
    });

};


exports.delete = (req, res) => {

  const id = req.params.id;

  userNotes.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
            status: 400,
            message: `Cannot delete Notes with id=${id}. Maybe Notes was not found!`
        });
      } else {
        res.send({
            status: 200,
            message: "Note was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        status: 500,
        message: "Could not delete note with id=" + id
      });
    });


};

exports.deleteAll = (req, res) => {

    userNotes.deleteMany({})
    .then(data => {
      res.send({
        status: 200,
        message: `${data.deletedCount} Notes were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        status: 500,
        message:
          err.message || "Some error occurred while removing all notes."
      });
    });



};


exports.findAllPublished = (req, res) => {

    userNotes.find({ is_active: true })
    .then(result => {
        res.send({status : 200, data : result});
    })
    .catch(err => {
      res.status(500).send({
        status: 500,
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });



};
