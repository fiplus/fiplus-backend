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
    this.EMAIL_FIELD = 'user';
    this.AUTH_FIELD = 'authData';
    this.DATA_FIELD = 'userData';
        this.DATA_USERNAME_FIELD = 'username';
        this.DATA_PROFILE_PIC_FIELD = 'profile_pic';
        this.DATA_AGE_FIELD = 'age';
        this.DATA_GENDER_FIELD = 'gender';
        this.DATA_LOCATION_PROXIMITY_SETTING_FIELD = 'location_proximity_setting';
};

User.prototype.createUser = function(email, userData, authData) {
    var userObject = {};
    userObject[this.EMAIL_FIELD] = email;
    var result;
    if(this.db.user.firstExample(userObject) == null)
    {
        userObject[this.AUTH_FIELD] = authData;
        userObject[this.DATA_FIELD] = userData;
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

User.prototype.saveUserToDb = function(email, password)
{
    this.createUser(email, {}, password);
};

User.prototype.getUserWithEmail = function(email)
{
    var userObject = {};
    userObject[this.EMAIL_FIELD] = email;
    var user_node = this.db.user.firstExample(userObject);
    if(user_node == null) {
        throw new error.NotFoundError("User " + email);
    }
    return user_node;
};

User.prototype.getAuthWithEmail = function(email)
{
    return this.getUserWithEmail(email)[this.AUTH_FIELD];
};
var console = require('console');

User.prototype.getDataObject = function(field, value){
    var dataObject = {};
    var updateObject = {};
    updateObject[this.DATA_FIELD] = dataObject;
    dataObject[field] = value;
    return updateObject;
};

User.prototype.updateUsername = function(target_user_id, username)
{
    var result;
    var updateObject = this.getDataObject(this.DATA_USERNAME_FIELD, username);
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
    var updateObject = this.getDataObject(this.DATA_PROFILE_PIC_FIELD, profile_pic);
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
    var updateObject = this.getDataObject(this.DATA_AGE_FIELD, age);
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
    var updateObject = this.getDataObject(this.DATA_GENDER_FIELD, gender);
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
    var updateObject = this.getDataObject(this.DATA_LOCATION_PROXIMITY_SETTING_FIELD, location_proximity_setting);
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Location Proximity Setting update for ' + target_user_id + ' failed.');
    }
    return result;
};

User.prototype.exists = function(user_id) {
    if(!this.db.user.exists(user_id)) {
        throw new error.NotFoundError("User " + user_id);
    }
    return true;
};

exports.User = User;