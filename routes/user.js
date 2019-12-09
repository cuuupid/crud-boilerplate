// DB
const mongoose = require('mongoose')
const User = mongoose.model('User')

// Security
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    auth: async (q, s) => {
        // Route Parameters
        const { email, password } = q.body
        if (!email || !password) return s.status(401).send({ error: 'Missing fields' })

        try {
            const u = await User.findOne({ email: email }).catch(e => false) // ignore promise rejections/errors

            if (!u || !bcrypt.compareSync(password, u.password)) return s.status(403).send({
                error: 'Invalid credentials' // don't tell them what they got wrong to make brute force harder
            })

            // sign a JWT token for use in auth'ed requests
            const token = jwt.sign({ id: u._id }, process.env.JWTKEY, { expiresIn: 86400 })
            return s.status(200).send({ accessToken: token })
        } catch (e) {
            return s.status(500).send({ error: e })
        }
    },
    create: async (q, s) => {
        // Route Parameters
        const { name, email, password } = q.body
        if (!email && !password) return s.status(401).send({ error: 'Missing fields' })

        try {
            const hash = bcrypt.hashSync(password, 8) // hash the password
            const u = new User({ // make the user
                email: email,
                password: hash,
                name: name
            })
            await u.save() // save the user
            return s.status(200).send({ success: true })
        } catch (e) {
            if (e.errors && e.errors.email && e.errors.email.kind == 'duplicate')
                return s.status(403).send({ error: 'A user with that email already exists' })
            return s.status(500).send({ error: e })
        }
    },
    read: async (q, s) => {
        // Auth Token
        const token = q.headers['x-access-token']
        if (!token) return s.status(401).send({ error: 'Missing fields' })

        // Check JWT Signature
        jwt.verify(token, process.env.JWTKEY, async (e, d) => {
            if (e) return s.status(500).send({ error: e })
            try {
                const u = await User.findById(d.id).select('name email') // don't return hashed password

                if (!u) return s.status(403).send({ error: 'Invalid credentials' })

                return s.status(200).send(u)
            } catch (e) {
                return s.status(500).send({ error: e })
            }
        })
    },
    update: async (q, s) => {
        // Auth Token
        const token = q.headers['x-access-token']
        if (!token) return s.status(401).send({ error: 'Missing fields' })

        // Route Parameters
        const { name, email } = q.body

        // Check JWT Signature
        jwt.verify(token, process.env.JWTKEY, async (e, d) => {
            if (e) return s.status(500).send({ error: e })
            try {
                const u = await User.findById(d.id)

                if (!u) return s.status(403).send({ error: 'Invalid credentials' })

                // update profile
                if (name) u.name = name;
                if (email) u.email = email;
                await u.save()

                // run find query again to ensure the update worked
                const u2 = await User.findById(d.id).select('name email') // don't return hashed password
                return s.status(200).send(u2)
            } catch (e) {
                if (e.errors && e.errors.email && e.errors.email.kind == 'duplicate')
                    return s.status(403).send({ error: 'A user with that email already exists' })
                return s.status(500).send({ error: e })
            }
        })
    },
    delete: async (q, s) => {
        // Auth Token
        const token = q.headers['x-access-token']
        if (!token) return s.status(401).send({ error: 'Missing fields' })

        // Route Parameters
        const { email, password } = q.body
        if (!email || !password) return s.status(401).send({ error: 'Missing fields' })

        // Check JWT Signature
        jwt.verify(token, process.env.JWTKEY, async (e, d) => {
            if (e) return s.status(500).send({ error: e })
            try {
                const u = await User.findById(d.id)

                if (!u) return s.status(403).send({ error: 'Invalid credentials' })

                // check email & password combo again to prevent token abuse
                if (u.email != email || !bcrypt.compareSync(password, u.password))
                    return s.status(401).send({ error: 'Invalid credentials' })

                // delete the user, no need to cascade because no other models/schemas
                await User.findByIdAndRemove(d.id)

                return s.status(200).send({ success: true })
            } catch (e) {
                return s.status(500).send({ error: e })
            }
        })
    }
}