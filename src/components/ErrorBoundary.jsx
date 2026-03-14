import React from "react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#0f0f13",
          color: "#e8e8f0",
          fontFamily: "'Space Mono', monospace",
        }}>
          <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#e04040" }}>
            Algo salió mal
          </h1>
          <p style={{ marginBottom: "24px", color: "#66668a" }}>
            Ha ocurrido un error inesperado. Por favor, reinicia la aplicación.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px",
              background: "#f0c040",
              color: "#0f0f13",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Reiniciar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
