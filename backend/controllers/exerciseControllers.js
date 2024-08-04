const db = require('../models')

const { Parts, Sections, Exercises, Images } = db

const exerciseControllers = {
  getBodySections: async (req, res) => {
    const bodySections = await Sections.findAll({
      order: [['id', 'ASC']],
      raw: true
    })

    res.json(bodySections)
  },
  getBodyPartsBySections: async (req, res) => {
    try {
      const sectionId = req.params.sectionId
      console.log(sectionId)
      const bodyParts = await Parts.findAll({
        where: {
          sections_id: sectionId
        },
        order: [['id', 'ASC']],
        raw: true
      })
      console.log(bodyParts)
      res.json(bodyParts)
    } catch (error) {
      console.error('Error retrieving body parts:', error)
      res.status(500).json({ error: 'An error occurred while retrieving body parts.' })
    }
  },
  getExercisesByPart: async (req, res) => {
    const partId = req.params.partId

    try {
      const exercises = await Exercises.findAll({
        where: {
          parts_id: partId
        },
        include: [{
          model: Images,
          attributes: ['url']
        }],
        order: [['id', 'ASC']]
      })

      // combine images with exercises
      const result = exercises.map(exercise => {
        return {
          ...exercise.toJSON(),
          images: exercise.Images.map(image => image.url)

        }
      })

      res.json(result)
    } catch (error) {
      console.error('Error retrieving exercises:', error)
      res.status(500).json({ error: 'An error occurred while retrieving exercises.' })
    }
  }

}

// getExercisesByBodyPart: async (req, res) => {
//   const { bodyPart } = req.query // Read the query parameter
//   console.log(bodyPart)

//   if (!bodyPart) {
//     return res.status(400).json({ error: 'Body part is required' });
//   }

//   try {
//     const part = await Part.findOne({
//       where: { name: bodyPart },
//       include: [{
//         model: Exercise,
//         as: 'exercises',
//         attributes: ['name']
//       }]
//     });

//     if (!part) {
//       return res.status(404).json({ error: 'Body part not found' });
//     }

//     const exercises = part.exercises.map(exercise => exercise.name);
//     res.json({ bodyPart, exercises });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }

// }

module.exports = exerciseControllers

// const messages = await Message.findAll({
//   order: [['createdAt', 'DESC']],
//   raw: true // Use raw:true to get plain js object directly
// })

// // Add imgUrl to each plain message
// const messagesWithImgUrl = await Promise.all(messages.map(async (message) => {
//   message.imgUrl = 'https://d348uiae81km7c.cloudfront.net/' + message.img
//   return message
// }))

// res.json(messagesWithImgUrl)

// bodyPart:core.arm.chest.gluteal.leg.back.shoulder
