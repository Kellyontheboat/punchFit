import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, navScheduleBtn, updateLoginButton, initializeModals } from './render/navRender.js'

import { addTrainingRecordBtn, renderSections, renderPartsBySection, renderExercisesByPart, sectionCheckBox } from './render/exerciseRender.js'

import { renderModules, renderItemsInModule, renderEditModule } from './render/moduleRender.js'

import { renderModulesBySections, renderMenuModules, renderItemsInMenuModule } from './render/menuRender.js'
import { addListenerEditMenuBtn } from './api/menuScript.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModule, addListenerAddMemoBtn } from './api/moduleScript.js' // addListenerModuleBtn,

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

addListenerEditMenuBtn

document.addEventListener('DOMContentLoaded', async function () {
  // use the Template HTML
  await injectHTML('.nav-container', navHTML)
  await injectHTML('.nav-separator', hrHTML)

  const pathArray = window.location.pathname.split('/')
  const pageType = pathArray[3]

  const { user, isAuthenticated } = await checkLoginStatus()// user:id username email
  if (isAuthenticated) {
    updateLoginButton()
  }

  // !Nav btn
  loginBtn()
  navScheduleBtn()
  initializeModals()
  navScheduleBtn(isAuthenticated)
  loginformSubmission() // click submit then login
  registerformSubmission()

  addSectionListener()
  await fetchSections()
  const sections = await fetchSections()

  if (pathArray[1] === 'menu') {
    if (!isAuthenticated) {
      window.location.href('/')
    }
    await renderModulesBySections()
    const itemContainers = document.querySelectorAll('.module-editing')
    await renderItemsInMenuModule(itemContainers)
    addListenerEditMenuBtn()
  } else if (pathArray[1] === 'training') {
    sectionCheckBox()
  } else if (pageType === 'parts') {
    const sectionId = pathArray[2]
    const { parts, partsId } = await fetchPartsBySection(sectionId)
    // render the exercises of first bodyPart
    const firstPartId = partsId[0]

    await renderEditModule(isAuthenticated)
    const itemContainers = document.querySelectorAll('.module-editing')
    renderItemsInModule(itemContainers)

    const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(firstPartId)
    await renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user })

    renderPartsBySection({ parts, partsId })
    addPartListener(user)
    addListenerAddMemoBtn()
  } else {
    // if homepage
    addTrainingRecordBtn(isAuthenticated)
    await renderSections(sections)
    // addListenerModuleBtn(user)
    await renderModules(user, isAuthenticated)
    addListenerModule(isAuthenticated)
    const itemContainers = document.querySelectorAll('.module-item')
    renderItemsInModule(itemContainers)
    // renderCalendar()
  }
})

// } else if (pageType === 'exercises') {
//   const bodyPartId = pathArray[2]
//   console.log(bodyPartId)
//   const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(bodyPartId)
//   renderExercisesByPart({ exercises, exercisesId, exercisesImgs })

//   addListenerExerciseBtn(user, isAuthenticated)
//   return
