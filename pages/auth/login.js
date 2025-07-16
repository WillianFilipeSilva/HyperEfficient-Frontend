window.addEventListener("DOMContentLoaded", () => {
  ;(async () => {
    if (window.AuthUtils && (await AuthUtils.isLoggedIn())) {
      window.location.href = "/pages/dashboard/dashboard.html"
      return
    }

    const loginForm = document.getElementById("loginForm")
    const emailInput = document.getElementById("email")
    const senhaInput = document.getElementById("senha")
    const loginButton = document.getElementById("loginButton")
    const errorMessage = document.getElementById("errorMessage")

    async function fazerLogin(email, senha) {
      try {
        const lembrarDeMim = document.getElementById("rememberMe").checked
        const data = await API_CONFIG.publicRequest(API_CONFIG.ENDPOINTS.LOGIN, {
          method: "POST",
          body: JSON.stringify({
            email: email,
            senha: senha,
            lembrarDeMim: lembrarDeMim,
          }),
        })

        localStorage.setItem("token", data.token)
        localStorage.setItem("usuario", JSON.stringify(data.usuario))

        showToast("Login realizado com sucesso!", "success")
        setTimeout(() => {
          window.location.href = "/pages/dashboard/dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Erro no login:", error)
        showError(error.message || "Erro ao conectar com o servidor")
        showToast(error.message || "Usuário ou senha inválidos", "error")
      }
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = emailInput.value.trim()
      const senha = senhaInput.value.trim()

      if (!email) {
        showError("Por favor, preencha o email")
        return
      }

      if (!senha) {
        showError("Por favor, preencha a senha")
        return
      }

      if (senha.length < 6) {
        showError("A senha deve ter pelo menos 6 caracteres")
        return
      }

      hideError()
      showButtonLoading(true)

      await fazerLogin(email, senha)

      showButtonLoading(false)
    })

    emailInput.addEventListener("input", () => hideError())
    senhaInput.addEventListener("input", () => hideError())

    function showError(message) {
      errorMessage.textContent = message
      errorMessage.classList.remove("hidden")
    }

    function hideError() {
      errorMessage.classList.add("hidden")
    }

    function showButtonLoading(show) {
      const loginButtonText = document.getElementById("loginButtonText")
      const loginButtonLoading = document.getElementById("loginButtonLoading")

      if (show) {
        loginButtonText.classList.add("hidden")
        loginButtonLoading.classList.remove("hidden")
        loginButton.disabled = true
      } else {
        loginButtonText.classList.remove("hidden")
        loginButtonLoading.classList.add("hidden")
        loginButton.disabled = false
      }
    }

    function showToast(message, type = "info") {
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(message, type)
        return
      }
      
      const toastCounter = window.toastCounter || 0
      window.toastCounter = toastCounter + 1
      
      const toast = document.createElement("div")
      const topPosition = 24 + (toastCounter) * 80
      toast.className = `fixed right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`
      toast.style.top = `${topPosition}px`

      const colors = {
        success: "bg-green-500/90 text-white",
        error: "bg-red-500/90 text-white",
        warning: "bg-yellow-500/90 text-black",
        info: "bg-blue-500/90 text-white",
      }

      const icons = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
      }

      toast.className += ` ${colors[type] || colors.info}`
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="${icons[type] || icons.info}"></i>
          <span>${message}</span>
        </div>
      `

      document.body.appendChild(toast)
      setTimeout(() => toast.classList.remove("translate-x-full"), 100)
      setTimeout(() => {
        toast.classList.add("translate-x-full")
        setTimeout(() => {
          toast.remove()
          window.toastCounter = Math.max(0, (window.toastCounter || 1) - 1)
        }, 300)
      }, 3000)
    }
  })()
})
