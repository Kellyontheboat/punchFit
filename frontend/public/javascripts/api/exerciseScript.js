import { renderExercisesByPart } from '../render/exerciseRender.js'

import { addListenerAddMemoBtn, addListenerModalAddMemoBtn } from './moduleScript.js'

export async function fetchSections () {
  try {
    const response = await fetch('/api/sections')
    if (!response.ok) {
      throw new Error(`Error fetching sections: ${response.statusText}`)
    }
    const data = await response.json()

    const sections = []
    const sectionsId = []

    data.forEach(section => {
      sections.push(section.section_name)
      sectionsId.push(section.id)
    })

    // Store sections and section IDs in localStorage
    localStorage.setItem('sections', JSON.stringify(sections))
    localStorage.setItem('sectionsId', JSON.stringify(sectionsId))

    return { sections, sectionsId }
  } catch (error) {
    return { sections: [], sectionsId: [] }
  }
}

export function addSectionListener () {
  const sectionContainersImg = document.querySelectorAll('.section-container-img')
  const sectionContainersModule = document.querySelectorAll('.section-container')

  const sectionContainers = [
    ...document.querySelectorAll('.section-container-img'),
    ...document.querySelectorAll('.section-container')
  ]

  sectionContainers.forEach(container => {
    container.addEventListener('click', (event) => {
      const sectionItem = container.querySelector('.section-item')
      if (sectionItem) {
        const sectionId = sectionItem.dataset.id
        window.location.href = `/sections/${sectionId}/parts`
      }
    })
  })
}

export async function fetchPartsBySection (sectionId) {
  const response = await fetch(`/api/sections/${sectionId}/parts`)
  const data = await response.json()
  const parts = []
  const partsId = []

  data.forEach(part => {
    parts.push(part.part_name)
    partsId.push(part.id)
  })

  return { parts, partsId }
}

//! check if need reload or add new route to each part
export async function addPartListener (user) {
  const partItems = document.querySelectorAll('.part-item')

  partItems.forEach(item => {
    item.addEventListener('click', async () => {
      const partId = item.dataset.id
      const { data, exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(partId)
      renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user })
      // ??after click the part the window should reload
      addListenerAddMemoBtn(user)
      addListenerModalAddMemoBtn(data)
    })
  })
}

export async function fetchExercisesByPart (partId) {
  const response = await fetch(`/api/parts/${partId}/exercises`)
  const data = await response.json()
  const exercises = []
  const exercisesId = []
  const exercisesImgs = []

  data.forEach(exercise => {
    exercises.push(exercise.name)
    exercisesId.push(exercise.id)
    exercisesImgs.push(exercise.images[0])
  })
  return { data, exercises, exercisesId, exercisesImgs }
}

export async function submitSectionForm (form, checkboxes) {
  form.addEventListener('submit', function (event) {
    event.preventDefault()
    const selectedSections = Array.from(checkboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value)

    window.location.href = `/menu?sectionIds=${selectedSections.join(',')}`
  })
};
