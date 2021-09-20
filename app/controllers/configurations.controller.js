exports.addConfiguration = async (req,res,next) => {
    try {
      res.send({ status: 1,message: "" });
    } catch (error) {
      next(error);
    }
    }