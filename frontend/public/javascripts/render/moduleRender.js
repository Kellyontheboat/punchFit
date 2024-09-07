import { getModules, getModuleBySection, getExerciseInModule, addListenerSaveModuleBtn, addListenerDeleteModuleItem } from '../api/moduleScript.js'

export async function renderModules (user, isAuthenticated) {
  if (!user) {
    return
  }

  try {
    const modules = await getModules(isAuthenticated)
    if (!modules) {
      console.error('Modules is undefined:', modules)
      return
    }

    // render each module in modules which has already been created
    // only the created modules have id
    console.log(modules)
    modules.forEach(module => {
      const sectionId = module.section_id
      const moduleId = module.id
      // specify the moduleWrap of the module by sectionId in this loop
      const moduleWrap = document.querySelector(`.section-item[data-id="${sectionId}"]`)
        .closest('.section-container')
        .querySelector('.part-module-wrap')
      console.log(moduleWrap)
      if (moduleWrap) {
        const moduleSpace = moduleWrap.querySelector('.module-item')
        if (moduleSpace) {
          const dataId = moduleSpace.dataset.id
          // render module is created
          moduleSpace.style.backgroundColor = '#f7d352'
          moduleSpace.style.color = '#bf3b3b'
          moduleSpace.dataset.id = moduleId
          moduleSpace.dataset.sectionId = sectionId
          const closestSection = document.querySelector(`.section-item[data-id="${sectionId}"]`).textContent
          moduleSpace.innerText = `${closestSection} Template has been created!
          Click to edit/create exercises inside.`
          moduleSpace.dataset.sectionName = closestSection
        }
      } else {
        console.warn(`No module-wrap found for sectionId ${sectionId}`)
      }
    })
  } catch (error) {
    console.error('Error in renderModules:', error)
  }
}

// render the module on each section page
export async function renderEditModule (isAuthenticated) {
  if (!isAuthenticated) return

  const sectionId = parseInt(window.location.pathname.split('/')[2], 10)
  const { modules } = await getModuleBySection(sectionId)
  // to get section name
  const sections = JSON.parse(localStorage.getItem('sections'))
  const section = sections[sectionId - 1]
  const moduleWrap = document.createElement('div')
  moduleWrap.classList.add('part-module-wrap')

  // module title(section name)
  const menuSectionItem = document.createElement('div')
  menuSectionItem.classList.add('part-menu-section-item')
  menuSectionItem.dataset.sectionId = sectionId
  menuSectionItem.textContent = section

  moduleWrap.appendChild(menuSectionItem)

  const moduleDiv = document.createElement('div')
  moduleDiv.classList.add('part-module-editing', 'list-group')
  moduleDiv.dataset.sectionId = sectionId

  if (modules.length === 0) {
    moduleDiv.textContent = `Let's select exercises into the ${section} module by clicking "+" in each card!`
    moduleDiv.classList.remove('part-module-editing')
    moduleDiv.classList.add('module-item')
    moduleWrap.appendChild(moduleDiv)
  } else {
    const module = modules[0]
    moduleDiv.dataset.id = module.id
    moduleWrap.appendChild(moduleDiv)
  }

  // Collapse/Expand button
  const collapseBtn = document.createElement('div')
  collapseBtn.classList.add('collapse-btn')
  collapseBtn.textContent = '<  >'
  moduleWrap.appendChild(collapseBtn)
  console.log(moduleDiv, collapseBtn)
  collapseBtn.addEventListener('click', () => {
    moduleWrap.classList.toggle('collapsed')
  })

  const hrElement = document.querySelector('hr')
  hrElement.insertAdjacentElement('afterend', moduleWrap)
}

// const itemContainers = document.querySelectorAll('.module-editing')
// only render when the module is already exist
export async function renderItemsInModule (itemContainers) {
  for (const container of itemContainers) {
    console.log(container)
    const moduleId = container.dataset.id
    if (!moduleId) continue

    const items = await getExerciseInModule(moduleId)

    container.innerHTML = '' // Clear the container before rendering items

    const listGroup = document.createElement('ul')
    listGroup.classList.add('list-group')
    container.appendChild(listGroup)

    items.forEach(item => {
      const listItem = document.createElement('li')
      const exerciseName = item.exercise.name
      const exerciseId = item.exercise_id
      const id = item.id
      const { reps, sets, weight } = item

      listItem.classList.add('list-group-item', 'menu-module-item')
      listItem.dataset.exerciseId = exerciseId
      listItem.dataset.id = id

      // Create the div for exerciseName
      const exerciseNameDiv = document.createElement('div')
      exerciseNameDiv.className = 'module-exercise-name'
      exerciseNameDiv.textContent = `* ${exerciseName}`

      // Create the div for exercise details
      const exerciseDetailsDiv = document.createElement('div')
      exerciseDetailsDiv.className = 'exercise-details'

      // Create the input for reps
      const repsInput = document.createElement('input')
      repsInput.type = 'number'
      repsInput.className = 'form-control reps-input'
      repsInput.value = reps
      repsInput.placeholder = 'Reps'

      // Create the text node for reps
      const repsText = document.createTextNode(' reps ')

      // Create the input for sets
      const setsInput = document.createElement('input')
      setsInput.type = 'number'
      setsInput.className = 'form-control sets-input'
      setsInput.value = sets
      setsInput.placeholder = 'Sets'

      // Create the text node for sets
      const setsText = document.createTextNode(' sets ')

      // Create the input for weight
      const weightInput = document.createElement('input')
      weightInput.type = 'number'
      weightInput.className = 'form-control weight-input'
      weightInput.value = weight
      weightInput.placeholder = 'Weight'

      // Create the text node for weight
      const weightText = document.createTextNode(' kg')

      // Create the delete button
      const deleteButton = document.createElement('button')
      deleteButton.className = 'btn btn-danger delete-menu-item'
      deleteButton.textContent = 'Del'

      // Append the inputs and text nodes to the exerciseDetailsDiv
      exerciseDetailsDiv.appendChild(repsInput)
      exerciseDetailsDiv.appendChild(repsText)
      exerciseDetailsDiv.appendChild(setsInput)
      exerciseDetailsDiv.appendChild(setsText)
      exerciseDetailsDiv.appendChild(weightInput)
      exerciseDetailsDiv.appendChild(weightText)
      exerciseNameDiv.appendChild(deleteButton)

      // Append exerciseNameDiv and exerciseDetailsDiv to the listItem
      listItem.appendChild(exerciseNameDiv)
      listItem.appendChild(exerciseDetailsDiv)

      listGroup.appendChild(listItem)
    })

    // Create and append the save button
    const saveBtn = document.createElement('button')
    saveBtn.classList.add('btn', 'btn-primary', 'save-menu-module')
    saveBtn.innerText = 'Save changes'
    listGroup.appendChild(saveBtn)

    // Add delete button listeners after rendering the items
    addListenerDeleteModuleItem(listGroup)
    addListenerSaveModuleBtn()
  }
}

// new added item render right away
export function renderExerciseToModuleContainer ({ funcModuleId, exerciseId, exerciseName, reps, sets, weight }) {
  let moduleContainer = document.querySelector(`[data-id="${funcModuleId}"].part-module-editing`)

  if (!moduleContainer) {
    console.log("no module container,create new")
    const existingElement = document.querySelector('.list-group')
    const newListGroup = document.createElement('div')
    newListGroup.classList.add('part-module-editing', 'list-group')
    newListGroup.dataset.id = funcModuleId

    existingElement.replaceWith(newListGroup)
    moduleContainer = newListGroup
  }

  let listGroup = moduleContainer.querySelector('ul.list-group')
  if (!listGroup) {
    listGroup = document.createElement('ul')
    listGroup.classList.add('list-group')
    moduleContainer.appendChild(listGroup)
  }

  const listItem = document.createElement('li')
  listItem.classList.add('list-group-item', 'menu-module-item')
  listItem.dataset.exerciseId = exerciseId

  // Replace the static text with input fields for reps, sets, and weight
  listItem.innerHTML = `
    * ${exerciseName}
    <div class="exercise-details">
    <input type="number" class="form-control reps-input" value="${reps}" placeholder="Reps"> reps 
    <input type="number" class="form-control sets-input" value="${sets}" placeholder="Sets"> sets 
    <input type="number" class="form-control weight-input" value="${weight}" placeholder="Weight"> kg
    <button class="btn btn-danger delete-menu-item">Del</button>
    </div>
  `

  const saveBtn = listGroup.querySelector('.save-menu-module')
  if (saveBtn) {
    console.log(listGroup)
    listGroup.insertBefore(listItem, saveBtn)
  } else {
    listGroup.appendChild(listItem)
  }

  if (!saveBtn) {
    const newSaveBtn = document.createElement('button')
    newSaveBtn.classList.add('btn', 'btn-primary', 'save-menu-module')
    newSaveBtn.innerText = 'Save changes'
    listGroup.appendChild(newSaveBtn)
    addListenerSaveModuleBtn()
  }
  addListenerDeleteModuleItem(listGroup)
}
