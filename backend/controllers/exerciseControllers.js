const db = require('../models')

const { Parts, Sections, Exercises, Images, Instructions } = db

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
      const bodyParts = await Parts.findAll({
        where: {
          sections_id: sectionId
        },
        order: [['id', 'ASC']],
        raw: true
      })
      res.json(bodyParts)
    } catch (error) {
      res.status(500).json({ error: `${error.message}. An error occurred while retrieving body parts.` })
    }
  },
  getExercisesByPart: async (req, res) => {
    const partId = req.params.partId

    try {
      const exercises = await Exercises.findAll({
        where: {
          parts_id: partId
        },
        include: [
          {
            model: Images,
            attributes: ['url', 'exercises_id']
          },
          {
            model: Instructions,
            attributes: ['instruction_text', 'exercises_id']
          }
        ],
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
      res.status(500).json({ error: `${error.message}. An error occurred while retrieving exercises.` })
    }
  }

}

module.exports = exerciseControllers
