import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { RoleType, rolesEnum } from '../constants';

// Interface for connected users
interface ConnectedUser {
  userId: string;
  socketId: string;
  role: RoleType;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: ConnectedUser[] = [];

  // Initialize Socket.IO with the HTTP server
  initialize(server: http.Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ORIGINS?.split(',') || [],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
    return this.io;
  }

  // Set up socket event handlers
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle user authentication and role assignment
      socket.on('authenticate', (data: { userId: string; role: RoleType }) => {
        const { userId, role } = data;
        
        // Remove any existing connections for this user
        this.connectedUsers = this.connectedUsers.filter(
          (user) => user.userId !== userId
        );
        
        // Add the new connection
        this.connectedUsers.push({
          userId,
          socketId: socket.id,
          role
        });
        
        console.log(`User authenticated: ${userId} with role ${role}`,this.connectedUsers);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers = this.connectedUsers.filter(
          (user) => user.socketId !== socket.id
        );
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  // Get socket instance
  getIO() {
    return this.io;
  }

  // Send notification to all admin users
  sendToAdmins(event: string, data: any) {
    if (!this.io) return;
    const adminSockets = this.connectedUsers
      .filter((user) => user.role === rolesEnum.ADMIN)
      .map((admin) => admin.socketId);

    adminSockets.forEach((socketId) => {
      this.io?.to(socketId).emit(event, data);
    });
  }

  // Send notification to a specific user
  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    console.log('Sending to user:', userId, event, data,this.connectedUsers);
    const userSockets = this.connectedUsers
      .filter((user) => user.userId === userId)
      .map((user) => user.socketId);

    userSockets.forEach((socketId) => {
      this.io?.to(socketId).emit(event, data);
    });
  }
}

export default new SocketService(); 