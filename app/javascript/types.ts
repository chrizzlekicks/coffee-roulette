interface User {
	username: string | undefined;
	password: string;
}

interface NewUser extends User {
	email: string;
	confirmPassword: string;
}

type UserStatus = Pick<User, "username"> & { isLoggedIn: boolean };
