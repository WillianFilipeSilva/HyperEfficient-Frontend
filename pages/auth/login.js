// Script de login externo para HyperEfficient

window.addEventListener("DOMContentLoaded", () => {
  ;(async () => {
    if (window.AuthUtils && (await AuthUtils.isLoggedIn())) {
      window.location.href = "/pages/dashboard/dashboard.html"
      return
    }

    // Elementos do DOM
    const loginForm = document.getElementById("loginForm")
    const emailInput = document.getElementById("email")
    const senhaInput = document.getElementById("senha")
    const loginButton = document.getElementById("loginButton")
    const errorMessage = document.getElementById("errorMessage")

    // Função para fazer login
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

        // Sempre salvar no localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("usuario", JSON.stringify(data.usuario))

        // Mostrar sucesso e redirecionar
        showToast("Login realizado com sucesso!", "success")
        setTimeout(() => {
          window.location.href = "/pages/dashboard/dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Erro no login:", error)
        showError(error.message || "Erro ao conectar com o servidor")
      }
    }

    // Event listener para o formulário
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = emailInput.value.trim()
      const senha = senhaInput.value.trim()

      // Validação básica
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

    // Limpar erro quando o usuário começar a digitar
    emailInput.addEventListener("input", () => hideError())
    senhaInput.addEventListener("input", () => hideError())

    // Funções auxiliares
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
      const toast = document.createElement("div")
      toast.className = `fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`

      const colors = {
        success: "bg-green-500/90 text-white",
        error: "bg-red-500/90 text-white",
        warning: "bg-yellow-500/90 text-black",
        info: "bg-blue-500/90 text-white",
      }

      toast.className += ` ${colors[type] || colors.info}`
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="fas fa-check-circle"></i>
          <span>${message}</span>
        </div>
      `

      document.body.appendChild(toast)
      setTimeout(() => toast.classList.remove("translate-x-full"), 100)
      setTimeout(() => {
        toast.classList.add("translate-x-full")
        setTimeout(() => toast.remove(), 300)
      }, 3000)
    }
  })()
})
