import { renderExercisesByPart } from '../render/exerciseRender.js'

import { addListenerAddMemoBtn } from './moduleScript.js'
export async function fetchSections() {
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

    return { sections, sectionsId }
  } catch (error) {
    console.error('Error fetching sections:', error)
    return { sections: [], sectionsId: [] }
  }
}

export function addSectionListener() {
  const sectionItems = document.querySelectorAll('.section-item')

  sectionItems.forEach(item => {
    item.addEventListener('click', async () => {
      const sectionId = item.dataset.id
      window.location.href = `/sections/${sectionId}/parts`
    })
  })
}

export async function fetchPartsBySection(sectionId) {
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

//! check if need reload or add new route to each part
export async function addPartListener(user) {
  const partItems = document.querySelectorAll('.part-item')

  partItems.forEach(item => {
    item.addEventListener('click', async () => {
      const partId = item.dataset.id
      console.log(partId)
      const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(partId)
      renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user })
      // ??after click the part the window should reload
      addListenerAddMemoBtn(user)
    })
  })
}

export async function fetchExercisesByPart(partId) {
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

