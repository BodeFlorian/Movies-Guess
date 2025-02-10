import './index.scss'
const Modal = ({ children }) => {
  return (
    <div className="modal">
      <div className="modal__overlay">{children}</div>
    </div>
  )
}

export default Modal
