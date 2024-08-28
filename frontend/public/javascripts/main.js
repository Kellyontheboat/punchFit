import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, navScheduleBtn, updateLoginButton, initializeModals } from './render/navRender.js'

import { addTrainingRecordBtn, renderSections, renderPartsBySection, renderExercisesByPart, exerciseCardModal, sectionCheckBox, partContainerStickOnTop } from './render/exerciseRender.js'

import { renderModules, renderItemsInModule, renderEditModule } from './render/moduleRender.js'

import { welcomeMessage } from './render/scheduleRender.js'

import { addListenerDelScheduleBtn } from './api/scheduleScript.js'

import { renderModulesBySections, renderMenuModules, renderItemsInMenuModule, renderSubmitMenuBtn } from './render/menuRender.js'

import { addListenerEditMenuBtn, addListenerSubmitMenu } from './api/menuScript.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModule, addListenerAddMemoBtn, addListenerModalAddMemoBtn } from './api/moduleScript.js' // addListenerModuleBtn,

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

// import { handleInMsg, uploadNotification, sendMsg } from './api/chatScript.js'

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
  initializeModals()
  navScheduleBtn(isAuthenticated)
  loginformSubmission() // click submit then login
  registerformSubmission()

  // !section part
  addSectionListener()
  await fetchSections()
  const sections = await fetchSections()
  if (pathArray[1] === 'consult') {
    console.log(sections)
    // handleInMsg()
    // uploadNotification()
    // sendMsg()
  } else if (pathArray[1] === 'schedules') {
    console.log(sections)
    // await addTrainingRecordBtn(isAuthenticated)
    welcomeMessage()
    addListenerDelScheduleBtn()
  } else if (pathArray[1] === 'module') {
    await renderModulesBySections()
    const itemContainers = document.querySelectorAll('.module-editing')
    await renderItemsInMenuModule(itemContainers)
    addListenerEditMenuBtn()
  } else if (pathArray[1] === 'menu') {
    if (!isAuthenticated) {
      window.location.href = '/'
    }
    await renderModulesBySections()
    const itemContainers = document.querySelectorAll('.module-editing')
    await renderItemsInMenuModule(itemContainers)
    addListenerEditMenuBtn()
    addListenerSubmitMenu()
  } else if (pathArray[1] === 'training') {
    sectionCheckBox()
  } else if (pageType === 'parts') {
    const sectionId = pathArray[2]
    const { parts, partsId } = await fetchPartsBySection(sectionId)
    // render the exercises of first bodyPart
    const firstPartId = partsId[0]

    await renderEditModule(isAuthenticated)
    const itemContainers = document.querySelectorAll('.part-module-editing')
    renderItemsInModule(itemContainers)

    const { data, exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(firstPartId)
    await renderExercisesByPart({ data, exercises, exercisesId, exercisesImgs, user })
    // exerciseCardModal(data)

    renderPartsBySection({ parts, partsId })
    addPartListener(user)
    addListenerAddMemoBtn()
    addListenerModalAddMemoBtn(data)
    partContainerStickOnTop()
  } else {
    // if homepage
    addTrainingRecordBtn(isAuthenticated)
    addListenerModule(isAuthenticated)
    // await renderSections(sections) for rendering section module move to /module
  }
})

// } else if (pageType === 'exercises') {
//   const bodyPartId = pathArray[2]
//   console.log(bodyPartId)
//   const { exercises, exercisesId, exercisesImgs } = await fetchExercisesByPart(bodyPartId)
//   renderExercisesByPart({ exercises, exercisesId, exercisesImgs })

//   addListenerExerciseBtn(user, isAuthenticated)
//   return
