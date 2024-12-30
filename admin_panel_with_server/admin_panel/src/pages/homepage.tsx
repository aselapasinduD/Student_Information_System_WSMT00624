import baseAPI from '../states/api';
/**
 * This component handle the homepage funtions and data
 * 
 * @returns {JSX.Element}
 * @since 1.0.0
 */
const homepage = () => {
    return(
        <div className="homepage">
            <h1 className="text-center">Student Management System</h1>
            <a href={baseAPI + "/admin-login"} className="btn btn-primary">Login</a>
        </div>
    )
}

export default homepage;