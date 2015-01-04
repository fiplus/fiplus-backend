var db = require('org/arangodb').db;
var error = require('error');

/**
 * Constructs a user db interface object
 * @constructor
 * Required fields: email, age, gender, location proximity setting
 */
var User = function()
{
    this.db = db;
    this.COLLECTION_NAME = 'user';
    this.EMAIL_FIELD = 'email';
    this.USERNAME_FIELD = 'username';
    this.PROFILE_PIC_FIELD = 'profile_pic';
    this.AGE_FIELD = 'age';
    this.GENDER_FIELD = 'gender';
    this.LOCATION_PROXIMITY_SETTING_FIELD = 'location_proximity_setting';
};

User.prototype.getUserWithEmail = function(email)
{
    var emailField = this.EMAIL_FIELD;
    var userObject = {emailField:email};
    return this.db.user.firstExample(userObject);
}

User.prototype.saveUserToDb = function(email)
{
    var emailField = this.EMAIL_FIELD;
    var userObject = {emailField:email};
    var result;
    if(this.db.user.firstExample(userObject) == null)
    {
        result = this.db.user.save(userObject);
        if(result.error == true)
        {
            throw new error.GenericError('Saving ' + email + ' failed.');
        }
    }
    else
    {
        throw new error.NotAllowedError('Duplicate Users');
    }
    return result;
};

User.prototype.updateUserUsername = function(target_user_id, username)
{
    var usernameField = this.USERNAME_FIELD;
    var result;
    result = this.db.user.update(target_user_id, {usernameField:username});
    if(result.error == true)
    {
        throw new error.GenericError('Username update for ' + target_user_id + ' failed.');
    }
    return result;
}

User.prototype.updateUserProfilePic = function(target_user_id, profile_pic)
{
    var profile_picField = this.PROFILE_PIC_FIELD;
    var result;
    result = this.db.user.update(target_user_id, {profile_picField:profile_pic});
    if(result.error == true)
    {
        throw new error.GenericError('Profile pic update for ' + target_user_id + ' failed.');
    }
    return result;
}

User.prototype.updateUserAge = function(target_user_id, age)
{
    var ageField = this.AGE_FIELD;
    var result;
    result = this.db.user.update(target_user_id, {ageField:age});
    if(result.error == true)
    {
        throw new error.GenericError('Age update for ' + target_user_id + ' failed.');
    }
    return result;
}

User.prototype.updateUserGender = function(target_user_id, gender)
{
    var genderField = this.GENDER_FIELD;
    var result;
    result = this.db.user.update(target_user_id, {genderField:gender});
    if(result.error == true)
    {
        throw new error.GenericError('Gender update for ' + target_user_id + ' failed.');
    }
    return result;
}

User.prototype.updateUserLocationProximitySetting = function(target_user_id, location_proximity_setting)
{
    var location_proximity_settingField = this.LOCATION_PROXIMITY_SETTING_FIELD;
    var result;
    result = this.db.user.update(target_user_id, {location_proximity_settingField:location_proximity_setting});
    if(result.error == true)
    {
        throw new error.GenericError('Location Proximity Setting update for ' + target_user_id + ' failed.');
    }
    return result;
}

exports.User = User;