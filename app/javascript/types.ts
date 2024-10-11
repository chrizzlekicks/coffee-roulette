interface User {
	username: string;
	password: string;
}

interface NewUser extends User {
	email: string;
	confirmPassword: string;
}
