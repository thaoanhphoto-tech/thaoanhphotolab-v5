import { PostProductionProject } from './components/studio-management/post-production/types';
import { getContracts } from './contractStore';

const STORAGE_KEY = 'app_post_production_projects_v1';

const createInitialProjects = (): PostProductionProject[] => {
    const contracts = getContracts();
    const closedContract = contracts.find(c => c.id === 'contract-1');
    if (closedContract) {
        return [
            {
                id: `pp-${closedContract.id}`,
                contractId: closedContract.id,
                customerName: closedContract.customerName,
                status: 'waiting_selection',
                files: {
                    originalsUrl: 'https://drive.google.com/drive/folders/originals_folder_link',
                    customerSelectionUrl: '',
                    retouchVersions: [],
                },
                editRequests: [],
                createdAt: closedContract.createdAt,
            }
        ];
    }
    return [];
}


export const getPostProductionProjects = (): PostProductionProject[] => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            return JSON.parse(json);
        }
        const initialData = createInitialProjects();
        savePostProductionProjects(initialData);
        return initialData;
    } catch (e) {
        return createInitialProjects();
    }
};

export const savePostProductionProjects = (projects: PostProductionProject[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
        console.error("Failed to save post-production projects.", e);
    }
};

export const updatePostProductionProject = (updatedProject: PostProductionProject): void => {
    let projects = getPostProductionProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
        projects[index] = updatedProject;
    } else {
        projects.push(updatedProject);
    }
    savePostProductionProjects(projects);
};
