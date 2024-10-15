import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, navScheduleBtn, updateLoginButton, initializeModals, coachNavbar, scrollVideoAutoPlay } from './render/navRender.js'

import { addTrainingRecordBtn, renderSections, renderPartsBySection, renderExercisesByPart, exerciseCardModal, sectionCheckBox, partContainerStickOnTop } from './render/exerciseRender.js'

import { renderModules, renderItemsInModule, renderEditModule } from './render/moduleRender.js'

import { renderPosts, renderExerciseInPosts } from './render/postRender.js'

import { addListenerDelScheduleBtn, getSchedules, getSchedulesItems } from './api/scheduleScript.js'

import { renderModulesBySections, renderMenuModules, renderItemsInMenuModule, renderSubmitMenuBtn } from './render/menuRender.js'

import { renderConsultRoom, renderFilteredStudentList } from './render/consultRender.js'

import { addListenerEditMenuBtn, addListenerSubmitMenu } from './api/menuScript.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModule, addListenerAddMemoBtn, addListenerModalAddMemoBtn } from './api/moduleScript.js' // addListenerModuleBtn,

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

import { addListenerConsultBtn, initUserSocket, coachGetPostContent, addSendMsgListeners } from './api/consultScript.js'

document.addEventListener('DOMContentLoaded', async function () {
  // use the Template HTML
  await injectHTML('.nav-container', navHTML)
  await injectHTML('.nav-separator', hrHTML)
  loginBtn()

  const pathArray = window.location.pathname.split('/')
  console.log(pathArray)
  const pageType = pathArray[3]

  const { user, isAuthenticated } = await checkLoginStatus()// user:id username email

  let isCoach;
  if (isAuthenticated) {
    updateLoginButton(user);
    ({ isCoach } = await coachNavbar(user));
    if (isCoach && pathArray[1] !== 'consult') {
      window.location.href = '/consult'
    }
  } else {
    if(window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }


  // !Nav btn
  
  initializeModals()
  navScheduleBtn(isAuthenticated)
  await loginformSubmission() // clickListener submit then login
  
  registerformSubmission()

  // !section part
  addSectionListener()
  await fetchSections()
  const sections = await fetchSections()

  if (pathArray[1] === 'posts') {
    if (isCoach) {
      window.location.href = '/consult'
    }
    const { scheduleIds, schedules } = await getSchedules()
    await renderPosts(schedules)
    await renderExerciseInPosts()
    await initUserSocket(user)
    await addListenerConsultBtn(user)
  } else if (pathArray[1] === 'consult') {
    if (!isCoach) {
      window.location.href = '/training'
      return
    }
    console.log('consult page')
    await initUserSocket(user)
  } else if (pathArray[1] === 'schedules') {
    if (isCoach) {
      window.location.href = '/consult'
    }
    console.log(sections)
    addListenerDelScheduleBtn()
    // const { scheduleIds, schedules } = await getSchedules()
    // await renderPosts(schedules)
    // await renderExerciseInPosts()
    // addListenerConsultBtn(user)
  } else if (pathArray[1] === 'module') {
    if (isCoach) {
      window.location.href = '/consult'
    }
    await renderModulesBySections()
    const itemContainers = document.querySelectorAll('.module-editing')
    await renderItemsInMenuModule(itemContainers)
    addListenerEditMenuBtn()
  } else if (pathArray[1] === 'menu') {
    if (!isAuthenticated) {
      window.location.href = '/'
    } else if (isCoach) {
      window.location.href = '/consult'
    }
    await renderModulesBySections()
    const itemContainers = document.querySelectorAll('.module-editing')
    await renderItemsInMenuModule(itemContainers)
    addListenerEditMenuBtn()
    addListenerSubmitMenu()
  } else if (pathArray[1] === 'training') {
    if (isCoach) {
      window.location.href = '/consult'
    }
    sectionCheckBox()
  } else if (pageType === 'parts') {
    if (isCoach) {
      window.location.href = '/consult'
    }
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
    if (isAuthenticated) {
      document.querySelector('.index-login-btn').remove()
    }
    document.querySelector('.before-footer').style.backgroundColor = '#0c0c0c';
    document.body.style.backgroundColor = '#0c0c0c';
    //} 
    //addTrainingRecordBtn(isAuthenticated)
    //addListenerModule(isAuthenticated)
    scrollVideoAutoPlay()

  }
})
