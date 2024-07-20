document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const bodyPart = urlParams.get('bodyPart');

  // Check if query parameter exists and fetch exercises
  if (window.location.pathname === "/exercises" && bodyPart) {
    console.log(bodyPart);
    fetchExercises(bodyPart);
    return; // Exit the function to avoid setting up event listeners
  }

  // Set up event listeners for body parts
  const bodyParts = ['core', 'arms', 'chest', 'glutes', 'legs', 'back', 'shoulders'];

  bodyParts.forEach(part => {
    const element = document.getElementById(part);
    if (element) {
      element.addEventListener('click', function () {
        window.location.href = `/exercises?bodyPart=${part}`;
      });
    }
  });

  function fetchExercises(bodyPart) {
    console.log(bodyPart);
    fetch(`/api/exercises?bodyPart=${bodyPart}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => renderExercises(data.exercises))
      .catch(error => console.error('Error fetching exercises:', error));
  }

  function renderExercises(exercises) {
    console.log(exercises);
    const exerciseList = document.createElement('ul');
    exercises.forEach(exercise => {
      const listItem = document.createElement('li');
      listItem.textContent = exercise;
      exerciseList.appendChild(listItem);
    });
    document.body.appendChild(exerciseList);
  }
});