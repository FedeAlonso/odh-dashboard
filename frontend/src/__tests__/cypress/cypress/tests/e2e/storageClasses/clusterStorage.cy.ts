import { TEST_USER } from '~/__tests__/cypress/cypress/utils/e2eUsers';
import {
  provisionClusterStorageSCFeature,
  tearDownClusterStorageSCFeature,
} from '~/__tests__/cypress/cypress/utils/storageClass';
import { addClusterStorageModal } from '~/__tests__/cypress/cypress/pages/clusterStorage';
import { projectListPage, projectDetails } from '~/__tests__/cypress/cypress/pages/projects';
import { findAddClusterStorageButton } from '~/__tests__/cypress/cypress/utils/clusterStorage';
import { disableNonDefaultStorageClasses } from '~/__tests__/cypress/cypress/utils/oc_commands/storageClass';

const dspName = 'qe-cluster-storage-sc-dsp';

describe('Regular Users can make use of the Storage Classes in the Cluster Storage tab from DSP ', () => {
  // before(() => {
  //   provisionClusterStorageSCFeature(dspName, TEST_USER.USERNAME);
  // });

  // after(() => {
  //   tearDownClusterStorageSCFeature(dspName);
  // });

  it('If all SC are disabled except one, the SC dropdown should be disabled', () => {
    cy.visitWithLogin('/projects', TEST_USER);
    // Open the project
    projectListPage.filterProjectByName(dspName);
    projectListPage.findProjectLink(dspName).click();
    // Go to cluster storage tab
    projectDetails.findSectionTab('cluster-storages').click();
    // Disable all non-default storage classes
    disableNonDefaultStorageClasses().then(() => {
      // Open the Create cluster storage Modal
      findAddClusterStorageButton().click();

      // Check that the SC Dropdown is disabled
      addClusterStorageModal.findStorageClassSelect().should('be.disabled');
    });
  });
});
