const exerciseControllers = {
  getExercisesByBodyPart: (req, res) => {
    const { bodyPart } = req.query;  // Read the query parameter

    // Temp exercises data
    const exercises = {
      core: ['Plank', 'Crunches'],
      arms: ['Bicep Curl', 'Tricep Extension', 'Forearm Flexor'],
      chest: ['Bench Press', 'Chest Fly'],
      glutes: ['Glute Bridge', 'Squats'],
      legs: ['Leg Press', 'Hamstring Curl', 'Leg Extension', 'Adductor Machine', 'Abductor Machine'],
      back: ['Deadlift', 'Lat Pulldown', 'Row', 'Shrug'],
      shoulders: ['Shoulder Press', 'Lateral Raise']
    };

    console.log(bodyPart)

    if (!bodyPart || !exercises[bodyPart]) {
      return res.status(404).json({ error: 'Body part not found' });
    }

    res.json({ bodyPart, exercises: exercises[bodyPart] });
  }
};

module.exports = exerciseControllers;