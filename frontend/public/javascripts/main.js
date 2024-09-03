import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, navScheduleBtn, updateLoginButton, initializeModals } from './render/navRender.js'

import { addTrainingRecordBtn, renderSections, renderPartsBySection, renderExercisesByPart, exerciseCardModal, sectionCheckBox, partContainerStickOnTop } from './render/exerciseRender.js'

import { renderModules, renderItemsInModule, renderEditModule } from './render/moduleRender.js'

import { renderPosts, renderExerciseInPosts } from './render/postRender.js'

import { addListenerDelScheduleBtn, getSchedules, getSchedulesItems } from './api/scheduleScript.js'

import { renderModulesBySections, renderMenuModules, renderItemsInMenuModule, renderSubmitMenuBtn } from './render/menuRender.js'

import { addListenerEditMenuBtn, addListenerSubmitMenu } from './api/menuScript.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModule, addListenerAddMemoBtn, addListenerModalAddMemoBtn } from './api/moduleScript.js' // addListenerModuleBtn,

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

import { addListenerConsultBtn, initCoachSocket, coachGetNotification } from './api/consultScript.js'

document.addEventListener('DOMContentLoaded', async function () {
  // use the Template HTML
  await injectHTML('.nav-container', navHTML)
  await injectHTML('.nav-separator', hrHTML)

  const pathArray = window.location.pathname.split('/')
  console.log(pathArray)
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

  if (pathArray[1] === 'posts') {
    const { scheduleIds, schedules } = await getSchedules()
    await renderPosts(schedules)
    await renderExerciseInPosts()
  } else if (pathArray[1] === 'consult') {
    console.log('consult page')
    console.log(sections)
    coachGetNotification()
    initCoachSocket(user)
    // addListenerConsultBtn(user)
  } else if (pathArray[1] === 'schedules') {
    console.log(sections)
    // welcomeMessage()
    addListenerDelScheduleBtn()
    const { scheduleIds, schedules } = await getSchedules()
    await renderPosts(schedules)
    await renderExerciseInPosts()
    addListenerConsultBtn(user)
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
