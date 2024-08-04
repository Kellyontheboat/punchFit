document.addEventListener('DOMContentLoaded', async function () {
  const pathArray = window.location.pathname.split('/')
  const pageType = pathArray[3]
  console.log(pathArray)

  if (pageType === 'parts') {
    const sectionId = pathArray[2]
    console.log(sectionId)
    const { parts, partsId } = await fetchPartsBySection(sectionId)
    renderPartsBySection({ parts, partsId })
    addPartListener()
    return
  } else if (pageType === 'exercises') {
    const bodyPartId = pathArray[2]
    console.log(bodyPartId)
    const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(bodyPartId)
    renderExercisesByPart({ exercises, exercisesId, exercisesImgs })
    return
  }

  const sections = await fetchSections()
  console.log(sections)
  renderSections(sections)

  async function fetchSections () {
    try {
      const response = await fetch('/api/sections')
      const data = await response.json()
      console.log(data)

      const sections = []
      const sectionsId = []

      data.forEach(section => {
        sections.push(section.section_name)
        sectionsId.push(section.id)
      })

      return { sections, sectionsId }
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  function renderSections ({ sections, sectionsId }) {
    const sectionsContainer = document.querySelector('.sections-container')
    sections.forEach((section, index) => {
      const sectionDiv = document.createElement('div')
      sectionDiv.classList.add('section-item')
      sectionDiv.textContent = section
      sectionDiv.dataset.id = sectionsId[index]
      sectionsContainer.appendChild(sectionDiv)
    })
  }

  function addSectionListener () {
    const sectionItems = document.querySelectorAll('.section-item')

    sectionItems.forEach(item => {
      item.addEventListener('click', async () => {
        const sectionId = item.dataset.id
        window.location.href = `/sections/${sectionId}/parts`
      })
    })
  }

  async function fetchPartsBySection (sectionId) {
    const response = await fetch(`/api/sections/${sectionId}/parts`)
    const data = await response.json()
    console.log(data)
    const parts = []
    const partsId = []

    data.forEach(part => {
      parts.push(part.part_name)
      partsId.push(part.id)
    })

    return { parts, partsId }
  }

  function renderPartsBySection ({ parts, partsId }) {
    const partsContainer = document.querySelector('.parts-container')
    parts.forEach((part, index) => {
      const partDiv = document.createElement('div')
      partDiv.classList.add('part-item')
      partDiv.textContent = part
      partDiv.dataset.id = partsId[index]
      partsContainer.appendChild(partDiv)
    })
  }

  function addPartListener () {
    const partItems = document.querySelectorAll('.part-item')

    partItems.forEach(item => {
      item.addEventListener('click', async () => {
        const partId = item.dataset.id
        console.log(partId)
        window.location.href = `/parts/${partId}/exercises`
      })
    })
  }

  async function fetchExercisesByPart (partId) {
    const response = await fetch(`/api/parts/${partId}/exercises`)
    const data = await response.json()
    console.log(data)
    const exercises = []
    const exercisesId = []
    const exercisesImgs = []

    data.forEach(exercise => {
      exercises.push(exercise.name)
      exercisesId.push(exercise.id)
      exercisesImgs.push(exercise.images[0])
    })

    return { exercises, exercisesId, exercisesImgs }
  }

  function renderExercisesByPart ({ exercises, exercisesId, exercisesImgs }) {
    const exercisesContainer = document.querySelector('.exercises-container')
    exercisesContainer.innerHTML = ''
    exercises.forEach((exercise, index) => {
      const exerciseDiv = document.createElement('div')
      exerciseDiv.classList.add('exercise-item')
      const nameDiv = document.createElement('div')
      nameDiv.textContent = exercise
      exerciseDiv.appendChild(nameDiv)
      const img = document.createElement('img')
      img.src = exercisesImgs[index]
      img.alt = `Image for ${exercise}`
      img.classList.add('exercise-image')
      exerciseDiv.appendChild(img)
      exerciseDiv.dataset.id = exercisesId[index]
      exercisesContainer.appendChild(exerciseDiv)
    })
  }
  addSectionListener()
})
