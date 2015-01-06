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
    var userObject = {};
    userObject[this.EMAIL_FIELD] = email;
    return this.db.user.firstExample(userObject);
};

User.prototype.saveUserToDb = function(email)
{
    var userObject = {};
    userObject[this.EMAIL_FIELD] = email;
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
    var result;
    var updateObject = {};
    updateObject[this.USERNAME_FIELD] = username;
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Username update for ' + target_user_id + ' failed.');
    }
    return result;
};

User.prototype.updateUserProfilePic = function(target_user_id, profile_pic)
{
    var result;
    var updateObject = {};
    updateObject[this.PROFILE_PIC_FIELD] = profile_pic;
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Profile pic update for ' + target_user_id + ' failed.');
    }
    return result;
};

User.prototype.updateUserAge = function(target_user_id, age)
{
    var result;
    var updateObject = {};
    updateObject[this.AGE_FIELD] = age;
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Age update for ' + target_user_id + ' failed.');
    }
    return result;
};

User.prototype.updateUserGender = function(target_user_id, gender)
{
    var result;
    var updateObject = {};
    updateObject[this.GENDER_FIELD] = gender;
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Gender update for ' + target_user_id + ' failed.');
    }
    return result;
};

User.prototype.updateUserLocationProximitySetting = function(target_user_id, location_proximity_setting)
{
    var result;
    var updateObject = {};
    updateObject[this.LOCATION_PROXIMITY_SETTING_FIELD] = location_proximity_setting;
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Location Proximity Setting update for ' + target_user_id + ' failed.');
    }
    return result;
};

exports.User = User;