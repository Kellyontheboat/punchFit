import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { navScheduleBtn, updateLoginButton, initializeModals, coachNavbar, scrollVideoAutoPlay } from './render/navRender.js'

import { renderPartsBySection, renderExercisesByPart, sectionCheckBox, partContainerStickOnTop } from './render/exerciseRender.js'

import { renderItemsInModule, renderEditModule } from './render/moduleRender.js'

import { renderPosts, renderExerciseInPosts } from './render/postRender.js'

import { addListenerDelScheduleBtn, getSchedules } from './api/scheduleScript.js'

import { renderModulesBySections, renderItemsInMenuModule } from './render/menuRender.js'

import { addListenerEditMenuBtn, addListenerSubmitMenu } from './api/menuScript.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn, getCookie } from './api/authScript.js'

import { addListenerAddMemoBtn, addListenerModalAddMemoBtn } from './api/moduleScript.js' // addListenerModuleBtn,

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

import { addListenerConsultBtn, initUserSocket } from './api/consultScript.js'

document.addEventListener('DOMContentLoaded', async function () {
  // use the Template HTML
  await injectHTML('.nav-container', navHTML)
  await injectHTML('.nav-separator', hrHTML)

  // Fetch a CSRF token if it's not already set
  if (!getCookie('XSRF-TOKEN')) {
    await fetch('/api/get-csrf-token', { method: 'GET', credentials: 'include' });
  }

  const csrfToken = getCookie('XSRF-TOKEN');
  loginBtn()

  const pathArray = window.location.pathname.split('/')
  const pageType = pathArray[3]

  const { user, isAuthenticated } = await checkLoginStatus()// user:id username email

  let isCoach;
  if (isAuthenticated) {
    updateLoginButton(user);
    ({ isCoach } = await coachNavbar(user));
    if (isCoach && pathArray[1] !== 'consult') {
      window.location.href = '/consult'
    }
    if(window.location.pathname === '/') {
      document.querySelector('.index-login-btn').remove()
      document.querySelector('.index-coach-login-btn').remove()
    }
  } else {
    if(window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }

  // !Nav btn
  
  initializeModals()
  navScheduleBtn(isAuthenticated)
  await loginformSubmission(csrfToken) // clickListener submit then login csrfToken
  
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
    await initUserSocket(user)
  } else if (pathArray[1] === 'schedules') {
    if (isCoach) {
      window.location.href = '/consult'
    }
    addListenerDelScheduleBtn()
    
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

    renderPartsBySection({ parts, partsId })
    addPartListener(user)
    addListenerAddMemoBtn()
    addListenerModalAddMemoBtn(data)
    partContainerStickOnTop()
  } else {
    document.querySelector('.before-footer').style.backgroundColor = '#0c0c0c';
    document.body.style.backgroundColor = '#0c0c0c';
    scrollVideoAutoPlay()
  }
})
