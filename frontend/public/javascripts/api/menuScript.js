import { fetchPartsBySection, fetchExercisesByPart, addPartListener } from './exerciseScript.js'

import { addListenerAddMemoBtn } from './moduleScript.js'
import { renderExercisesByPart, renderPartsBySection } from '../render/exerciseRender.js'

const token = localStorage.getItem('token')
export async function getModulesBySections (sectionIds) {
  const queryString = sectionIds.join(',')

  const response = await fetch(`/api/sections/modules?sectionIds=${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const modules = await response.json()
  const moduleId = []
  modules.forEach(module => {
    moduleId.push(module.id)
  })
  return { modules, moduleId }
}

export async function addListenerEditMenuBtn () {
  const EditMenuBtn = document.querySelectorAll('.edit-menu-module')

  for (const btn of EditMenuBtn) {
    btn.addEventListener('click', async function (event) {
      const sectionId = event.target.closest('.module-editing').dataset.sectionId

      const partsContainer = document.createElement('div')
      const exercisesContainer = document.createElement('div')
      partsContainer.classList = ('parts-container')
      exercisesContainer.classList = ('exercises-container')

      const moduleWrap = event.target.closest('.module-wrap')
      if (moduleWrap) {
        moduleWrap.insertAdjacentElement('afterend', partsContainer)
        partsContainer.insertAdjacentElement('afterend', exercisesContainer)
      }

      const { parts, partsId } = await fetchPartsBySection(sectionId)
      // render the exercises of first bodyPart
      const firstPartId = partsId[0]

      const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(firstPartId)
      const user = true
      await renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user })

      renderPartsBySection({ parts, partsId })
      addPartListener(user)
      addListenerAddMemoBtn()
    })
  }
}

//   EditMenuBtn.forEach(btn => {

//   })
// }
