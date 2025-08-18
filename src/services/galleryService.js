import { databaseService } from './databaseService';

/**
 * Gallery service to handle CRUD operations for gallery content
 */
export const galleryService = {
  /**
   * Get all gallery data
   */
  getGalleryData: async () => {
    try {
      const formData = await databaseService.getFormData();
      return formData?.other_custom_content?.gallery || {
        videos: [],
        beforeAfter: [],
        pastProjects: []
      };
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      throw error;
    }
  },

  /**
   * Update gallery data in the database
   */
  updateGalleryData: async (galleryData) => {
    try {
      const currentData = await databaseService.getFormData();
      const updatedData = {
        ...currentData,
        other_custom_content: {
          ...currentData.other_custom_content,
          gallery: galleryData
        }
      };
      
      return await databaseService._updateFormData(updatedData);
    } catch (error) {
      console.error('Error updating gallery data:', error);
      throw error;
    }
  },

  // Video CRUD operations
  videos: {
    add: async (video) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedVideos = [...galleryData.videos, video];
        
        await galleryService.updateGalleryData({
          ...galleryData,
          videos: updatedVideos
        });
        
        return { success: true, video };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    update: async (videoId, updatedVideo) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedVideos = galleryData.videos.map(video =>
          video.id === videoId ? { ...video, ...updatedVideo } : video
        );
        
        await galleryService.updateGalleryData({
          ...galleryData,
          videos: updatedVideos
        });
        
        return { success: true, video: updatedVideo };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    delete: async (videoId) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedVideos = galleryData.videos.filter(video => video.id !== videoId);
        
        await galleryService.updateGalleryData({
          ...galleryData,
          videos: updatedVideos
        });
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Before/After CRUD operations
  beforeAfter: {
    add: async (beforeAfterItem) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedBeforeAfter = [...galleryData.beforeAfter, beforeAfterItem];
        
        await galleryService.updateGalleryData({
          ...galleryData,
          beforeAfter: updatedBeforeAfter
        });
        
        return { success: true, beforeAfter: beforeAfterItem };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    update: async (itemId, updatedItem) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedBeforeAfter = galleryData.beforeAfter.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        );
        
        await galleryService.updateGalleryData({
          ...galleryData,
          beforeAfter: updatedBeforeAfter
        });
        
        return { success: true, beforeAfter: updatedItem };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    delete: async (itemId) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedBeforeAfter = galleryData.beforeAfter.filter(item => item.id !== itemId);
        
        await galleryService.updateGalleryData({
          ...galleryData,
          beforeAfter: updatedBeforeAfter
        });
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Past Projects CRUD operations
  pastProjects: {
    add: async (project) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedProjects = [...galleryData.pastProjects, project];
        
        await galleryService.updateGalleryData({
          ...galleryData,
          pastProjects: updatedProjects
        });
        
        return { success: true, project };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    update: async (projectId, updatedProject) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedProjects = galleryData.pastProjects.map(project =>
          project.id === projectId ? { ...project, ...updatedProject } : project
        );
        
        await galleryService.updateGalleryData({
          ...galleryData,
          pastProjects: updatedProjects
        });
        
        return { success: true, project: updatedProject };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    delete: async (projectId) => {
      try {
        const galleryData = await galleryService.getGalleryData();
        const updatedProjects = galleryData.pastProjects.filter(project => project.id !== projectId);
        
        await galleryService.updateGalleryData({
          ...galleryData,
          pastProjects: updatedProjects
        });
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
};
