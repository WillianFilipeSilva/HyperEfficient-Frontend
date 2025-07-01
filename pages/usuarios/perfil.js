window.addEventListener("DOMContentLoaded", () => {
  // Declare initAuthGuard, AuthUtils, and API_CONFIG variables here
  const initAuthGuard = () => {
    // Placeholder for initAuthGuard implementation
  }
  const AuthUtils = {
    getCurrentUser: () => {
      // Placeholder for getCurrentUser implementation
    },
    saveUser: (user) => {
      // Placeholder for saveUser implementation
    },
  }
  const API_CONFIG = {
    authenticatedRequest: async (url, options) => {
      // Placeholder for authenticatedRequest implementation
    },
  }

  let usuarioOriginal = null
  let modoEdicao = false

  const profileInitials = document.getElementById("profileInitials")
  const profileName = document.getElementById("profileName")
  const profileEmail = document.getElementById("profileEmail")

  const nameInput = document.getElementById("nameInput")
  const emailInput = document.getElementById("emailInput")
  const newPasswordInput = document.getElementById("newPasswordInput")
  const confirmPasswordInput = document.getElementById("confirmPasswordInput")
  const allInputs = [nameInput, emailInput, newPasswordInput, confirmPasswordInput]

  const editButton = document.getElementById("editButton")
  const saveButton = document.getElementById("saveButton")
  const cancelButton = document.getElementById("cancelButton")
  const errorMessageDiv = document.getElementById("errorMessage")

  function carregarInformacoesUsuario() {
    const usuario = AuthUtils.getCurrentUser()
    if (!usuario) {
      console.error("Usuário não encontrado no localStorage.")
      return
    }

    usuarioOriginal = { ...usuario }

    profileName.textContent = usuario.nome
    profileEmail.textContent = usuario.email
    profileInitials.textContent = getInitials(usuario.nome)

    nameInput.value = usuario.nome
    emailInput.value = usuario.email
  }

  function getInitials(name) {
    if (!name) return "U"
    const words = name.trim().split(" ")
    const initials = words.map((word) => word.charAt(0).toUpperCase()).join("")
    return initials.substring(0, 2)
  }

  function alternarModoEdicao(editar) {
    modoEdicao = editar

    if (editar) {
      editButton.classList.add("hidden")
      saveButton.classList.remove("hidden")
      cancelButton.classList.remove("hidden")
    } else {
      editButton.classList.remove("hidden")
      saveButton.classList.add("hidden")
      cancelButton.classList.add("hidden")
    }

    allInputs.forEach((input) => {
      if (input.id !== "emailInput") {
        input.disabled = !editar
      }
    })

    if (!editar) {
      newPasswordInput.value = ""
      confirmPasswordInput.value = ""
      hideError()
      nameInput.value = usuarioOriginal.nome
    }
  }

  async function salvarAlteracoes() {
    hideError()
    const nome = nameInput.value.trim()
    const novaSenha = newPasswordInput.value
    const confirmarSenha = confirmPasswordInput.value

    if (!nome) {
      showError("O campo nome é obrigatório.")
      return
    }

    if (novaSenha !== confirmarSenha) {
      showError("As senhas não coincidem.")
      return
    }

    const payload = {
      id: usuarioOriginal.id,
      nome: nome,
    }

    if (novaSenha) {
      payload.senha = novaSenha
    }

    showButtonLoading(true)

    try {
      const response = await API_CONFIG.authenticatedRequest(`/usuarios/${usuarioOriginal.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      const usuarioAtualizado = { ...usuarioOriginal, nome: nome }
      AuthUtils.saveUser(usuarioAtualizado)

      showToast("Perfil atualizado com sucesso!", "success")
      carregarInformacoesUsuario()
      alternarModoEdicao(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      showError(error.message || "Erro desconhecido ao salvar.")
    } finally {
      showButtonLoading(false)
    }
  }

  function showError(message) {
    errorMessageDiv.textContent = message
    errorMessageDiv.classList.remove("hidden")
  }

  function hideError() {
    errorMessageDiv.classList.add("hidden")
  }

  function showButtonLoading(show) {
    const textSpan = saveButton.querySelector("[data-text]")
    const loadingSpan = saveButton.querySelector("[data-loading]")

    if (show) {
      textSpan.classList.add("hidden")
      loadingSpan.classList.remove("hidden")
      saveButton.disabled = true
    } else {
      textSpan.classList.remove("hidden")
      loadingSpan.classList.add("hidden")
      saveButton.disabled = false
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

  function configurarBotoes() {
    editButton.addEventListener("click", () => alternarModoEdicao(true))
    saveButton.addEventListener("click", salvarAlteracoes)
    cancelButton.addEventListener("click", () => alternarModoEdicao(false))
  }

  waitForDependencies().then(() => {
    carregarInformacoesUsuario()
    configurarBotoes()
  })

  function waitForDependencies() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.Utils && window.API_CONFIG && window.AuthUtils) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }
})
