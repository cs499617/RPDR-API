/**
 * This is where we can generate a token for user based on their access level
 */
export class AuthService {

    static generateAdminToken(){

        return 'admin_token'; // static tokens will always be given

    }

    static generateBasicToken(){

        return 'basic_token'; // static tokens will always be given
    }


}
