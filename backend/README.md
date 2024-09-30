# Backend

## Prérequis

### Node

- https://nodejs.org/en prendre la version 20.11 (versions gérables avec `nvm`)

### MySQL

Pour le MySQL local, vous avez 2 options: **(ne faites pas les deux!)**

**Option 1: Utiliser `docker`**

- installer `docker` et le lancer : https://www.docker.com/products/docker-desktop/
- `docker compose up` depuis la **racine** du projet pour lancer un container mysql
- utiliser le `.env` fourni (voir instructions plus bas)
- Si un Mac Apple Silicon chip est utilisé, le changement suivant se doit d'être appliquer dans le fichier `docker-compose-yml` a la source du projet.

```yaml
version: "3.8"

services:
  mysql:
    platform: linux/amd64
    image: mysql:8.0.36-debian
    container_name: tse-mysql
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: tse_db
      MYSQL_USER: tse_user
      MYSQL_PASSWORD: tse_tse
    volumes:
      - tse_mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  tse_mysql_data:
```

**Option 2: Utiliser directement MySQL**

- installer directement `mysql`: https://dev.mysql.com/downloads/installer/
- configurer mysql et lancer le serveur local
- creer un `.env` en fonction de votre configuration (voir instructions plus bas)

### Recommandés (très facultatif):

- vscode. Vous pouvez ajouter un fichier `.vscode/settings.json` à la racine du projet avec le contenu suivant pour formater quand vous sauvegardez:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["typescript"],
  "editor.tabSize": 2
}
```

## Installation

> **Très important** !

Vous devez créer un fichier `.env`, à la racine du backend, car celui-ci contiendra des variables d'environnement qui ne doivent pas être partagé dans le dépôt git.

la structure du fichier devrait être telle quelle:

```bash
PORT=5001 # Le port de l'API
DB_URL=mysql://user:password@host:port/database # uri de connexion
# exemple developpement local:
# DB_URL=mysql://touriste:expirer@localhost:3306/sportapp
SECRET=nimportequellescaractères # Pour hasher les mots de passes

# Pour le basic Auth de l'admin, OBLIGATOIRE
ADMIN_NAME=admin
ADMIN_PASSWORD=1234
```

Si vous avez utilisé `docker` pour `mysql`(option 1), voici le contenu du fichier `.env` à créer:

```bash
PORT=5001
DB_URL=mysql://tse_user:tse_tse@localhost:3306/tse_db
SECRET=nimportequellescaractères
```

Pour lancer le backend:

```bash
npm install # Installation des dépendances

npm run generate # Génère les fichiers sql pour la DB

npm run migrate # Envoi le contenu des fichiers sql dans la DB

npm start # Pour lancer l'API
```

## Scripts

Dans le fichier `package.json` vous pourrez trouver des scripts dans le champ `scripts`:

```json
  "scripts": {
    "start": "nodemon src/server.ts",
    "build": "tsc && nodemon dist/server.js",
    "test": "npx jest --coverage",
    "lint": "eslint --ext .js,.ts",
    "generate": "drizzle-kit generate:mysql",
    "migrate": "drizzle-kit push:mysql",
    "drop": "drizzle-kit drop"
  }
```

Pour lancer un script, il suffit de le précéder par `npm run` au terminal (Exeption de `npm start` `npm test` qui est reconnu comme un mot clé).

Soit pour `start`:
`npm start`

Pour les autres: `npm run "script"`

| script             | fonction                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| start              | Lance le serveur. Se mettra à jour lors de sauvegarde                                    |
| build              | Prépare un build pour du projet (ne pas vous en soucier tout de suite)                   |
| test               | Lance les tests                                                                          |
| lint               | lance eslint pour détecter les erreurs de styles                                         |
| generate (drizzle) | Convertis les modèles en fichier pour la base de données                                 |
| migrate (drizzle)  | Envoi les modèles convertit à la base de données pour créer créer les tables de celle-ci |
| drop (drizzle)     | Efface une migration                                                                     |

## Structure

Les fichiers à modifier pour le projet se situent dans le dossier src.

```
src
├── app.ts
├── controllers
│   └── UserController.ts
├── db
│   ├── db.ts
│   └── migrations
├── models
│   └── users.ts
├── routes
│   └── user.ts
└── server.ts
```

Les routeurs exportés dans `src/routes/` sont importés dans `src/app.ts`. Les nouveaux routeurs devront être ajoutés dans un section à cette effet. La section en question est indiquée par des commentaires.

### Le rôle des dossiers dans `src/`:

#### models/

Les modèles de données tel utilisé pour intéragir avec la base de données.

L'ORM utilisé est [drizzle orm](https://orm.drizzle.team/)

Par exemple, pour créer un modèle d'utilisateur simple:

> Pour plus d'information sur les schémas: <br> https://orm.drizzle.team/docs/sql-schema-declaration <br> https://orm.drizzle.team/docs/column-types/mysql

```ts
import { int, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const User = mysqlTable(
  "users", // Nom de la table
  {
    // Les champs
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 256 }),
    password: varchar("password", { length: 256 }),
  },
  (users) => ({
    nameIndex: uniqueIndex("username_idx").on(users.username),
  })
);
```

Vous allez maintenant pouvoir importer User dans d'autre fichier pour interagir avec la table utilisateur (exemple dans controllers).

#### controllers/

Les contrôleurs servent à manipuler les données de la base de données. Soit pour modifier, ajouter, retirer ou modifier.

Voici un exemple: https://orm.drizzle.team/docs/rqb

```ts
import { Request, Response } from "express";
import { users } from "../models/users";
import { validationResult } from "express-validator";
import { db } from "../db/db";
import { eq } from "drizzle-orm";

export const createUser = async (req: Request, res: Response) => {
  // Expres-validator valide les chaines de validations données dans la route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Le mot de passe doit être hasher ceci est juste un exemple
    const { username, password } = req.body;
    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    // Vérifie si un utilisateur ayant ce nom existe
    if (userExist.length !== 0) {
      return res.status(409).json({ error: "A user already has that name" });
    }

    // Insert nouvel utilisateur dans la DB
    const user = await db.insert(users).values([{ username, password }]);
    return res.status(201).json({ message: "user added succesfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
```

Ses contrôleurs sont plus tard appelés par les routes. Nous le verrons dans la prochaine section.

#### routes/:

Contient les routes de l'API. L'adresse de notre serveur (lorsque testé localement) est http://localhost:5001.

Si vous n'êtes pas familier avec REST API je vous recommande de lire: https://www.geeksforgeeks.org/rest-api-introduction/

Voici un exemple pour ajouter une route à notre API (qui utilisera le contrôleur créer précédemment):

Je vous recommande de vous simplifier la vie pour la validation des données et d'utiliser express-validator: https://express-validator.github.io/docs/category/guides

```ts
import express from "express";
import { body } from "express-validator";
import { createUser } from "../controllers/UserController";

const router = express.Router();

// Noter qu'il est possible de remplacer post par
// get, put, path, delete et possiblement d'autre
router.post(
  "/create", //http://localhost:5001/user/create
  [body("username").isString(), body("password").isString()], //validation des champs données dans le body avec express-validator.
  createUser // Le contrôleur qui va créer un nouvel utilisateur.
);

export default router;
```

Noter que vous pouvez ajouter plusieurs routes par router.

**Très important**

Une nouvelle route doit être documentée à l'aide de [swagger](https://swagger.io/specification/v3/). Il est important de documenter pour permettre à vos collègues de pouvoir consulter et voir vos routes. La documentation générée peut être consultée à la route `/api-docs` soit http://localhost:5001/api-docs/

Pour déboguer vous pouvez utiliser: https://editor.swagger.io/

Exemple de documentation http://localhost:5001/api-docs/#/user/post_user_create:

```ts
/**
 * @swagger
 * /user/create:
 *  post:
 *    tags:
 *    - user
 *    summary: Create user
 *    description: Route to create a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username of a user
 *                example: jean-papa
 *              password:
 *                type: string
 *                description: The password of a user
 *                example: 1234
 *    responses:
 *      201:
 *        description: New user created
 *      400:
 *        description: Bad Request
 *      409:
 *        description: Conflict
 *      500:
 *        description: Server Error
 */
router.post(
  "/create",
  [body("username").isString(), body("password").isString()],
  createUser
);
```

Noter qu'il est possible de créer des schémas pour factoriser les types d'objets et ne pas avoir à toujours les retranscrire. Il est aussi possible d'ajouter des exemples de réponses.

#### db

Dossier concernant les migrations pour la db. Il contient aussi le fichier `db.ts`

### Dossier `__tests__/`

La structure de ce fichier doit avoir la même structure que `src/`.

Par exemple, pour la route user nous créerons un fichier `__test__/routes/user.test.js` (il est important d'ajouter test au nom de fichier).

Les tests sont écrits avec [Jest](https://jestjs.io/docs/getting-started).

`npm test`: va effectuer les tests ainsi qu'une couverture de code.

```ts
import request from "supertest";
import app from "../../src/app";
import { db, closeDbConnection } from "../../src/db/db";
import { users } from "../../src/models/users";
import { eq } from "drizzle-orm/sql";

const user = { username: "test-user", password: "1234" };

beforeAll(() => {
  // Noter que possiblement pas une bonne pratique
  // Pourrait utiliser mock?
  return db.delete(users).where(eq(users.username, "test-user"));
});

afterAll(() => {
  return closeDbConnection();
});

describe("User routes", () => {
  describe("POST /user/create", () => {
    const route: string = "/user/create";

    test("should create a new user", async () => {
      const res = await request(app).post(route).send(user);
      expect(res.status).toBe(201);
    });

    test("should send back a conflict error", async () => {
      const res = await request(app)
        .post(route)
        .send(user)
        .set("Content-Type", "application/json");
      expect(res.statusCode).toEqual(409);
    });

    test("should send back a bad request error", async () => {
      const badUser = { username: 1234, password: 1234 };
      const res = await request(app)
        .post(route)
        .send(badUser)
        .set("Content-Type", "application/json");
      expect(res.statusCode).toEqual(400);
    });
  });
});
```

Il est aussi possible de sélectionner les des suites de tests voulues tel que : `npx jest __tests__/routes/user.test.ts`.

Exemple d'exécution:

```
 PASS  __tests__/routes/user.test.ts
  User routes
    POST /user/create
      ✓ should create a new user (29 ms)
      ✓ should send back a conflict error (5 ms)
      ✓ should send back a bad request error (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.15 s, estimated 3 s
Ran all test suites matching /__tests__\/routes\/user.test.ts/i.
```

---

### Middlewares

Les middlewares servent à ajouter des processus intermédiaires sur une route. L'explication est pas claire, mais pas de souci je vais vous montrer des exemples.

Les middlewares sont situés dans le dossier `src/middlewares`.

#### Authorisation

Pour éviter d'avoir à valider les permissions sur une route à chaque fois que nous établissons une nouvelle route nous pouvons ajouter un middleware d'autorisation.

Voici une route qui ne dispose pas de protection, soit n'importe qui peut y accéder.:

```ts
app.use("/route-to-protect", (req: Request, res: Response) => {
  return res.json({ msg: "Je suis accessible par tous" });
});
```

Pour protéger la route, il faut ajouter `verifyUserToken`:

```ts
app.use("/protected-route", verifyUserToken, (req: Request, res: Response) => {
  return res.json({
    msg: `La route est maintenant accessible que lorsque vous êtes authentifié. L'ID de l'utilisateur est ${req.user?.userId}`,
  });
});
```

Noter que le type d'authentification est un simple bearer token. Soit l'entête Authorization doit contenir un token précédé de `Bearer `:

```http
POST http://localhost:5001/protected-route
Content-Type: application/json
Authorization: Bearer <token ici>

{
    "username": "Jean-papa",
    "password": "1234"
}
```

> exemple de token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNzg0MDI4MywiZXhwIjoxNzA3ODQzODgzfQ.fkmVip9QtEOcluK-ZYjeKkkDUheaN845lzSLONjx89E

#### Validation

Beaucoup plus simple que le middleware précédent. Si vous avez une chaîne de validateurs avec express-validator, il suffit tous simplement d'ajouter le middleware:

1. Après la chaîne de validateurs.
2. Avant le controller

Vous n'avez qu'à placer le middleware tel quel:

```ts
router.post(
  "/create",
  [body("username").isString(), body("password").isString()], // La chaîne de validateurs
  expressValidator, // AJOUTER ICI Le middleware
  createUser // Le controller
);
```

#### Gestion d'erreur

Encore plus simple que précédent. Le middleware est déjà déclaré dans `app.ts`, vous n'avez pas à l'ajouter dans vos routes. Quand vous faites un `try-catch`. Vous n'avez qu'à passer `error` à `next`.

Soit si nous

```ts
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction // À ajouter si vous voulez que le validateur fonctionne
) => {
  try {
    const { username, password } = req.body;
    const [userExist]: User[] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (userExist) {
      return res.status(409).json({ error: "A user already has that name" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values([{ username, password: hashedPassword }]);
    return res.status(201).json({ message: "user added succesfully" });
  } catch (error) {
    next(error); // ICI on passe l'erreur et le middleware s'en charge
  }
};
```
