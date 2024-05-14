import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(request, response) {
    const email = request.body ? request.body.email : null;
    const password = request.body ? request.body.password : null;

    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }

    const newUser = { email, password: sha1(password) };
    const insertData = await (await dbClient.usersCollection()).insertOne(newUser);
    const id = insertData.insertedId.toString();

    response.status(201).json({ email, id });
  }

  static async getMe(request, response) {
    const { user } = request;

    response.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

module.exports = UsersController;
