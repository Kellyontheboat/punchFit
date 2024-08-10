import { checkLoginStatus } from "./authScript.js"
import { showLoginModal } from "../render/render.js"
export async function addListenerModuleBtn(user, isAuthenticated){ 
  console.log("addListenerModuleBtn", isAuthenticated)
  document.querySelectorAll('.add-module-btn').forEach(button => {
    console.log(button)
    button.addEventListener('click', function () {
      if (!isAuthenticated ) {
        showLoginModal()
        return 
      }
      const sectionId = this.getAttribute('data-id')
      console.log(sectionId)
      const userId = user.id

      const data = {
        section_id: sectionId,
        member_id: userId,
      };
      console.log("addListenerModuleBtn",data)

      fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log('Module added successfully');
          } else {
            console.error('Failed to add module:', result.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    
    })
})
}

