export default function Toast({message}) {
  if(!message) return null
  return <div id="toast" className="toast" style={{display:'block'}}>{message}</div>
}
