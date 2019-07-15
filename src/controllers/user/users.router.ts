import { Router, Request, Response, NextFunction } from 'express';
import { BasicUser, IUserModel, ChangePasswordModel } from '../../models/src/index';
import { IDataAccessLayer } from '../../dataSources/dataAccessLayer';
import getAdminRolesForUser from '../../auth/getAdminRolesForUser';
import canIAdminister from '../../auth/canIAdmninster';
import { PasswordHelper } from '../../password.helper';


const winston = require('../../config/winston');

var DataSourceSwitch = require('../../dataSourceSwitch');

export class UserRouter {
  router: Router;
  private dataAccess: IDataAccessLayer;

  constructor() {
    this.router = Router();
    this.init();

    this.dataAccess = DataSourceSwitch.default as IDataAccessLayer;
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    var userDetails = req['userDetails'] as IUserModel;

    if (!userDetails) {
      res.sendStatus(401);
      return;
    }

    var dataAccess = DataSourceSwitch.default.dataSource;

    const roles = await dataAccess.getAllRoles();

    const users = await dataAccess.getUsers();

    var returnedUsers: IUserModel[] = [];

    users.forEach(user => {

      if (canIAdminister(userDetails, user)) {
        returnedUsers.push(user);
      }
    });

    res.json(returnedUsers);
  }

  public async getUserFromId(req: Request, res: Response, next: NextFunction) {
    var userDetails = req['userDetails'] as IUserModel;
    const id = req.query.id;

    var dataAccess = DataSourceSwitch.default.dataSource;

    const loadedUser = await dataAccess.getUserFromID(id);

    // Check if I can Administer this user or Is it me?
    if (canIAdminister(userDetails, loadedUser)) {
      res.json(loadedUser);
    } else {
      res.status(401).send({ message: 'Not Authorised for User' });
    }
  }
  public async deleteUser(req: Request, res: Response, next: NextFunction) {
  }
  public async addUser(req: Request, res: Response, next: NextFunction) {
    var userDetails = req['userDetails'] as IUserModel;
    var dataAccess = DataSourceSwitch.default.dataSource;

    var newUser = req.body as IUserModel;

    if (canIAdminister(userDetails, newUser, true)) {
      dataAccess.addUser(newUser);
    } else {
      res.status(401).send({ message: 'Not Authorised to create for User' });
    }
  }
  public async updateUser(req: Request, res: Response, next: NextFunction) {
    var userDetails = req['userDetails'] as IUserModel;
    var dataAccess = DataSourceSwitch.default.dataSource;

    var newUser = req.body as IUserModel;

    if (canIAdminister(userDetails, newUser, true)) {
      dataAccess.addUser(newUser);
    } else {
      res.status(401).send({ message: 'Not Authorised to create for User' });
    }
  }
  public async registerUser(req: Request, res: Response, next: NextFunction) {}
  public async resetPassword(req: Request, res: Response, next: NextFunction) {}

  public async confirmUser(req: Request, res: Response, next: NextFunction) {}
  public async changePassword(req: Request, res: Response, next: NextFunction) {
    
    var userDetails = req['userDetails'] as IUserModel;
    let changeRequest = req.body as ChangePasswordModel;
    // Get the existing user
    var dataAccess = DataSourceSwitch.default.dataSource;

    const loadedUser: IUserModel = await dataAccess.getUserFromID(changeRequest.userId);

    // Can I administer or is it me?
    if(!canIAdminister(userDetails, loadedUser)){
      res.status(400).send({ message: 'Not Authorised to Change Password' });
      next({ message: 'Not Authorised to Change Password' });
      return;
    }
    // Is valid current password
    let encPassword = PasswordHelper.encodePassword(changeRequest.currentPassword, loadedUser.salt);
    if(encPassword !== loadedUser.password){
      res.status(400).send({ message: 'Incorrect current Password' });
      next({ message: 'Incorrect current Password' });
      return;
    }

    // Change Password to encoded
    loadedUser.salt = PasswordHelper.generateSalt();
    loadedUser.password = PasswordHelper.encodePassword(changeRequest.newPassword, loadedUser.salt);
    loadedUser.passwordFailures = 0;
    loadedUser.passwordLastFailed = null;

    // Save User
    dataAccess.updateUser(loadedUser);
    res.status(200).send({ message: 'Password Changed' });
    next();
  }

  public async setPassword(req: Request, res: Response, next: NextFunction) {}

  init() {
    // Get Users
    this.router.get('/', this.getAll);

    // Get User
    this.router.get('/:id', this.getUserFromId);

    // Create User
    this.router.post('/', this.addUser);

    // Delete User
    this.router.delete('/:id', this.deleteUser);

    // Update User
    this.router.patch('/', this.updateUser);

    // register User
    this.router.post('/register', this.registerUser);

    // reset Password
    this.router.get('/resetPassword/:id', this.resetPassword);

    // Confirm Registration
    this.router.get('/confirm/:id', this.confirmUser);

    // Set Password (For Admin)
    this.router.post('/setPassword', this.setPassword);

    // Change Password (For the User)
    this.router.post('/changePassword', this.changePassword);
  }
}

const userRouter = new UserRouter().router;

export default userRouter;
