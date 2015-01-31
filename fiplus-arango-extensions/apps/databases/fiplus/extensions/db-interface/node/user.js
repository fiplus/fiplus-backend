var db = require('org/arangodb').db;
var error = require('error');
var foxx = require("org/arangodb/foxx");
var joi = require("joi");

var UserModel = foxx.Model.extend({
    schema: {
        user: joi.string().required(),
        authData: joi.object().required(),
        userData: joi.object().required()
    }
});

var users = new foxx.Repository(
    db._collection('user'),
    {model: User}
);

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
        this.DATA_DEVICE_IDS = 'device_ids';
};

User.prototype.createUser = function(email, userData, authData) {
    var userObject = {};
    userObject[this.EMAIL_FIELD] = email;
    var result;

    authData.active = true;

    if(this.db.user.firstExample(userObject) == null)
    {
        var user = new UserModel({
            user: email,
            userData: userData,
            authData: authData
        });
        result = users.save(user);

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

User.prototype.getUserWithId = function(id)
{
    this.exists(id);
    return this.db.user.document(id);
};


User.prototype.getAuthWithEmail = function(email)
{
    return this.getUserWithEmail(email)[this.AUTH_FIELD];
};

User.prototype.resolve = function (username)
{
    var user = users.firstExample({user: username});
    if (!user.get('_key')) {
        throw new error.NotFoundError("User " + email);
    }
    return user;
};

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

User.prototype.updateDeviceId = function(target_user_id, currentDeviceId, newDeviceId) {
    var result;

    // If currentDeviceId exists it means that a device is updating an existing device id rather
    // than adding a new device to the user.
    var user = db.user.document(target_user_id);
    var devicesIds = [];
    var deviceIds = user[this.DATA_FIELD][this.DATA_DEVICE_IDS];

    var devIndex = deviceIds.indexOf(currentDeviceId);
    if(devIndex != -1)
    {
        deviceIds[devIndex] = newDeviceId;
    }
    else
    {
        deviceIds.push(newDeviceId);
    }

    var updateObject = this.getDataObject(this.DATA_DEVICE_IDS, deviceIds);
    result = this.db.user.update(target_user_id, updateObject);
    if(result.error == true)
    {
        throw new error.GenericError('Device Id update for ' + target_user_id + ' failed.');
    }
    return result;
}

User.prototype.exists = function(user_id) {
    if(!this.db.user.exists(user_id)) {
        throw new error.NotFoundError("User " + user_id);
    }
    return true;
};

exports.User = User;