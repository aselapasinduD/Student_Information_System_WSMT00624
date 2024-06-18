const Login = () => {
    return(
        <div>
            <form action="/admin-login/login" method="post">
                <div>
                    <label htmlFor="username" >Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login;