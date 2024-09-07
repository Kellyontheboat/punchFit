import DOMPurify from '../../../../../../../../../node_modules/dompurify/dist/purify.es.mjs'

export const navHTML = `
  <div class="navbar-container">
    <div class="navbar">

    <div class="navbar-item-container">
    <a href="/" class="homepage-link">
      <span class="nav-title">PunchFit  打卡健身</span>
    </a>
    </div>

    <span class="nav-item-container">
      <span class="nav-item" id="login-register-btn">Login/Register.</span>

    <span>
    <!-- Modal: Login -->
    <div id="loginPopup" class="custom-raw-popup">
      <div class="popup-content">
    
        <div class="popup-title-container">
          <h2>Login</h2>
          <span class="close">&times;</span>
        </div>
        <form action="/api/user/auth" method="put" id="signin-form-login" novalidate>
          <div class="form-group">
            <input type="email" id="email" name="email" placeholder="Email" required>
          </div>
          <div class="form-group">
            <input type="password" id="password" name="password" placeholder="Password" required>
          </div>
          <div class="form-group">
            <button type="submit">Login</button>
          </div>
        </form>
        <span id="login-msg" class="login-popup-item"></span>
        <span class="login-popup-item" id="register-popup-btn">Don't have an account yet? <br>Click here to sign up.</span>

      </div>
    </div>


  <!-- Modal: Register -->
    <div id="registerPopup" class="custom-raw-popup">
  <div class="popup-content">
    <div class="popup-decorate"></div>
    <div class="popup-title-container">
      <h2>Register</h2>
      <span class="close">&times;</span>
    </div>
    <form id="signin-form-register" novalidate>
      <div class="form-group">
        <input type="text" id="name" name="username" placeholder="User Name" required>
      </div>
      <div class="form-group">
        <input type="email" id="register-email" name="email" placeholder="Email" required>
      </div>
      <div class="form-group">
        <input type="password" id="register-password" name="password" placeholder="Password" required>
      </div>
      <div class="form-group">
        <button type="submit">Create An Account</button>
      </div>
    </form>
    <span id="register-msg"></span>
    <span class="register-popup-item" id="login-popup-btn">Already have an account? <br>Click here to log in.</span>

  </div>
</div>

  
    </div>
</div>
`
export const hrHTML = '<hr>'

export function injectHTML (selector, html) {
  return new Promise((resolve) => {
    const sanitizedHTML = DOMPurify.sanitize(html)
    document.querySelectorAll(selector).forEach(element => {
      element.innerHTML = sanitizedHTML
    })
    resolve()
  })
}
