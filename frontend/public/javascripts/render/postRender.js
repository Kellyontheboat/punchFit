import { getSchedules, getSchedulesItems } from '../api/scheduleScript.js'

export async function renderPosts (posts) {
  const postContainer = document.getElementById('post-container')
  let postWrapper
  posts.forEach((post, index) => {

      postWrapper = document.querySelector('.current-post-wrapper');
      postWrapper = document.createElement('div')
      postWrapper.classList.add('post-wrapper')
    
    // Create a container for each post
    const postElement = document.createElement('div')
    postElement.classList.add('post')
    postElement.dataset.id = post.id

    const scheduleNameDiv = document.createElement('div')
    scheduleNameDiv.classList.add('schedule-name')
    scheduleNameDiv.innerText = `${post.schedule_name} / ${post.schedule_date}`
    postElement.appendChild(scheduleNameDiv)

    // Container for user note and coach comment
    const textContainer = document.createElement('div')
    textContainer.classList.add('text-post')
    // Create and append the content
    const contentElement = document.createElement('p')
    contentElement.textContent = post.content
    textContainer.appendChild(contentElement)
    scheduleNameDiv.appendChild(textContainer)

    // Create and append the video if available
    if (post.video) {
      const videoContainer = document.createElement('div')
      videoContainer.classList.add('video-post')
      const videoElement = document.createElement('video')
      videoElement.controls = true

      const sourceElement = document.createElement('source')
      sourceElement.src = post.videoUrl
      sourceElement.type = 'video/mp4'

      videoElement.appendChild(sourceElement)
      videoContainer.appendChild(videoElement)
      scheduleNameDiv.insertAdjacentElement('afterend', videoContainer)
    }

    // Create the coach consult button
    const consultBtn = document.createElement('button')
    consultBtn.type = 'submit'
    consultBtn.dataset.id = post.id
    consultBtn.classList.add('btn', 'btn-primary', 'consult')
    consultBtn.innerText = 'Consult Coach'
    textContainer.appendChild(consultBtn)

    // Append the post to the container

    postWrapper.appendChild(postElement)
    //if (index !== 0) {
      postContainer.appendChild(postWrapper)
    //}
  })
}

export async function renderExerciseInPosts () {
  const posts = document.querySelectorAll('.post')

  for (const post of posts) {
    const scheduleId = post.dataset.id
    const scheduleItems = await getSchedulesItems(scheduleId)
    renderExerciseInPost(scheduleItems, post)
  }
}

// render schedule items in each post
function renderExerciseInPost (scheduleItems, post) {
  const exerciseContainer = document.createElement('div')
  exerciseContainer.classList.add('exercise-post')

  // Create a wrapper div for exercises
  const moduleWrap = document.createElement('div')
  moduleWrap.classList.add('module-wrap')

  // Create a container for exercises
  const menuEditing = document.createElement('div')
  menuEditing.classList.add('module-editing', 'list-group')

  // Create a list for exercises
  const exerciseList = document.createElement('ul')
  exerciseList.classList.add('list-group')

  scheduleItems.forEach(item => {
    // Create list item for each exercise
    const exerciseItem = document.createElement('li')
    exerciseItem.classList.add('list-group-item', 'menu-module-item')
    exerciseItem.dataset.id = item.id

    // Add exercise details
    const exerciseDetails = document.createElement('div')
    exerciseDetails.classList.add('exercise-details')
    exerciseDetails.textContent = `${item.reps} reps / ${item.sets} sets / ${item.weight} kg`

    const exerciseSection = document.createElement('strong')
    const exerciseName = document.createElement('em')
    exerciseName.innerText = `${item.name}`
    exerciseSection.innerText = `${item.section}: `
    const exerciseSectionName = document.createElement('div')

    exerciseSectionName.appendChild(exerciseSection)
    exerciseSectionName.appendChild(exerciseName)
    exerciseItem.appendChild(exerciseSectionName)
    exerciseItem.appendChild(exerciseDetails)

    // Append to the list
    exerciseList.appendChild(exerciseItem)
  })

  menuEditing.appendChild(exerciseList)
  moduleWrap.appendChild(menuEditing)

  // Append the module wrap to the post container
  exerciseContainer.appendChild(moduleWrap)
  post.appendChild(exerciseContainer)
}
