import { navHTML, hrHTML, injectHTML } from './render/htmlTemplates.js'

import { showLoginModal, navScheduleBtn, updateLoginButton, initializeModals } from './render/navRender.js'

import { renderSections, renderPartsBySection, renderExercisesByPart } from './render/exerciseRender.js'

import { renderModules, renderEditModule, renderItemsInModule } from './render/moduleRender.js'

// import { renderCalendar } from './render/scheduleRender.js'

import { checkLoginStatus, loginformSubmission, registerformSubmission, loginBtn } from './api/authScript.js'

import { addListenerModuleBtn, addListenerModule, addListenerAddMemoBtn } from './api/moduleScript.js'

import { fetchSections, addSectionListener, fetchPartsBySection, addPartListener, fetchExercisesByPart } from './api/exerciseScript.js'

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

  // !Nav btn
  loginBtn()
  navScheduleBtn()
  initializeModals()
  navScheduleBtn(isAuthenticated)
  loginformSubmission() // click submit then login
  registerformSubmission()

  addSectionListener()

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
    addPartListener(user)
    addListenerAddMemoBtn(user, isAuthenticated)

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
    renderItemsInModule(itemContainers)
    // renderCalendar()
  }
})
