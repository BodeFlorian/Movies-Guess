import PropTypes from 'prop-types'
import './Modal.scss'

const Modal = ({ children }) => {
  return (
    <div className="modal">
      <div className="modal__overlay">{children}</div>
    </div>
  )
}

export default Modal

Modal.propTypes = {
  children: PropTypes.node.isRequired,
}
