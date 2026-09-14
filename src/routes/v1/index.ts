/**
 * @description: node moodules
 */
import { Router } from 'express';

/**
 * @description: Routes
 */
import AuthRoutes from '@/routes/v1/authenticate';
import UserRoutes from '@/routes/v1/user';

const router = Router();

//@description: root route
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'API is alive',
        status: 'ok',
        version: '1.0.0',
        docs: '',
        timestamp: new Date().toISOString(),
    });
});

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);

export default router;
