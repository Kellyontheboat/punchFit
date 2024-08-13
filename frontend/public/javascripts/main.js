import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, renderSections, renderPartsBySection, renderExercisesByPart, navScheduleBtn, updateLoginButton, renderModules, renderEditModule, renderItemsInModule } from './render/render.js'

import { checkLoginStatus, loginformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModuleBtn, addListenerModule, addListenerAddMemoBtn } from './api/moduleScript.js'

// import { navScheduleBtn } from './api/scheduleScript.js'

document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOMContentLoaded event fired.')
  // use the Template HTML
  await injectHTML('.nav-container', navHTML)
  await injectHTML('.nav-separator', hrHTML)

  const pathArray = window.location.pathname.split('/')
  const pageType = pathArray[3]
  console.log(pathArray)

  const { user, isAuthenticated } = await checkLoginStatus()// user:id username email
  if (isAuthenticated) {
    updateLoginButton()
  }
  navScheduleBtn(isAuthenticated)
  loginformSubmission() // click submit then login

  // !Nav btn
  loginBtn()
  navScheduleBtn()

  if (pageType === 'parts') {
    const sectionId = pathArray[2]
    console.log(sectionId)
    const { parts, partsId } = await fetchPartsBySection(sectionId)
    // render the exercises of first bodyPart
    const firstPartId = partsId[0]
    console.log(user)

    await renderEditModule(user)
    const itemContainers = document.querySelectorAll('.module-editing')
    renderItemsInModule(itemContainers)

    const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(firstPartId)
    await renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user })

    renderPartsBySection({ parts, partsId })
    addPartListener()
    addListenerAddMemoBtn(user, isAuthenticated)

    return
    // } else if (pageType === 'exercises') {
    //   const bodyPartId = pathArray[2]
    //   console.log(bodyPartId)
    //   const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(bodyPartId)
    //   renderExercisesByPart({ exercises, exercisesId, exercisesImgs })

  //   addListenerExerciseBtn(user, isAuthenticated)
  //   return
  } else {
    // if homepage
    console.log('homePage')
    const sections = await fetchSections()
    await renderSections(sections)
    addListenerModuleBtn(user)
    await renderModules(user, isAuthenticated)
    addListenerModule()
    const itemContainers = document.querySelectorAll('.module-item')
    console.log(itemContainers)
    renderItemsInModule(itemContainers)
  }

  async function fetchSections () {
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

  async function addPartListener () {
    const partItems = document.querySelectorAll('.part-item')

    partItems.forEach(item => {
      item.addEventListener('click', async () => {
        const partId = item.dataset.id
        console.log(partId)
        const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(partId)
        renderExercisesByPart({ exercises, exercisesId, exercisesImgs })

        // window.location.href = `/parts/${partId}/exercises`
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

  addSectionListener()
})
