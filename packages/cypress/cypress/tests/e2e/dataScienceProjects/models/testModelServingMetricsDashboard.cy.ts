/**
 * Verify User Can Serve And Query A Model -> Verify Metrics Dashboard Is Present
 *
 * Covers RHOAIENG-38045 and bug RHOAIENG-37686 (RCA: metrics dashboard for deployed model).
 * Reproduction steps: Deploy a serverless/raw model -> Navigate to metrics dashboard ->
 * View metrics for the deployed model -> Verify metrics content.
 */
import {
  ModelLocationSelectOption,
  ModelTypeLabel,
} from '@odh-dashboard/model-serving/types/form-data';
import type { DataScienceProjectData } from '../../../../types';
import { deleteOpenShiftProject } from '../../../../utils/oc_commands/project';
import { loadDSPFixture } from '../../../../utils/dataLoader';
import { HTPASSWD_CLUSTER_ADMIN_USER } from '../../../../utils/e2eUsers';
import { projectListPage, projectDetails } from '../../../../pages/projects';
import {
  modelServingGlobal,
  modelServingSection,
  modelServingWizard,
} from '../../../../pages/modelServing';
import { modelMetricsKserve } from '../../../../pages/modelMetrics';
import {
  checkInferenceServiceState,
  provisionProjectForModelServing,
} from '../../../../utils/oc_commands/modelServing';
import { retryableBefore } from '../../../../utils/retryableHooks';
import { generateTestUUID } from '../../../../utils/uuidGenerator';

let testData: DataScienceProjectData;
let projectName: string;
let modelName: string;
let modelFilePath: string;
let modelFormat: string;
let servingRuntime: string;
const awsBucket = 'BUCKET_1' as const;
const uuid = generateTestUUID();

describe('Verify User Can Serve And Query A Model - Verify Metrics Dashboard Is Present (RHOAIENG-38045, RHOAIENG-37686)', () => {
  retryableBefore(() =>
    loadDSPFixture('e2e/dataScienceProjects/testModelServingMetricsDashboard.yaml').then(
      (fixtureData: DataScienceProjectData) => {
        testData = fixtureData;
        projectName = `${testData.projectSingleModelAdminResourceName}-${uuid}`;
        modelName = testData.singleModelAdminName;
        modelFilePath = testData.modelOpenVinoPath;
        modelFormat = testData.modelFormat;
        servingRuntime = testData.servingRuntime;

        if (!projectName) {
          throw new Error('Project name is undefined or empty in the loaded fixture');
        }
        cy.log(`Loaded project name: ${projectName}`);
        provisionProjectForModelServing(
          projectName,
          awsBucket,
          'resources/yaml/data_connection_model_serving.yaml',
        );
      },
    ),
  );

  after(() => {
    deleteOpenShiftProject(projectName, { wait: true, ignoreNotFound: true, timeout: 300000 });
  });

  it(
    'Deploy a serverless model, navigate to metrics dashboard, and verify metrics content',
    {
      tags: [
        '@Smoke',
        '@SmokeSet3',
        '@Dashboard',
        '@ModelServing',
        '@NonConcurrent',
        '@RHOAIENG-38045',
        '@RHOAIENG-37686',
      ],
    },
    () => {
      cy.step('Log into the application');
      cy.visitWithLogin('/', HTPASSWD_CLUSTER_ADMIN_USER);

      cy.step(`Navigate to project ${projectName}`);
      projectListPage.navigate();
      projectListPage.filterProjectByName(projectName);
      projectListPage.findProjectLink(projectName).click();

      cy.step('Deploy a single model via Model Serving');
      projectDetails.findSectionTab('model-server').click();
      modelServingGlobal.selectSingleServingModelButtonIfExists();
      modelServingGlobal.findDeployModelButton().click();

      cy.step('Step 1: Model details');
      modelServingWizard.findModelLocationSelectOption(ModelLocationSelectOption.EXISTING).click();
      modelServingWizard.findLocationPathInput().clear().type(modelFilePath);
      modelServingWizard.findModelTypeSelectOption(ModelTypeLabel.PREDICTIVE).click();
      modelServingWizard.findNextButton().click();

      cy.step('Step 2: Model deployment');
      modelServingWizard.findModelDeploymentNameInput().clear().type(modelName);
      modelServingWizard.findResourceNameButton().click();
      modelServingWizard
        .findResourceNameInput()
        .should('be.visible')
        .invoke('val')
        .as('resourceName');
      modelServingWizard.findModelFormatSelectOption(modelFormat).click();
      modelServingWizard.selectServingRuntimeOption(servingRuntime);
      modelServingWizard.findNextButton().click();

      cy.step('Step 3: Advanced settings');
      modelServingWizard.findNextButton().click();

      cy.step('Step 4: Review');
      modelServingWizard.findSubmitButton().click();
      modelServingSection.findModelServerDeployedName(modelName);

      cy.step('Verify model is ready on the backend');
      cy.get<string>('@resourceName').then((resourceName) => {
        checkInferenceServiceState(resourceName, projectName, { checkReady: true });
      });

      cy.reload();

      cy.step('Navigate to the metrics dashboard for the deployed model');
      modelServingSection.findModelMetricsLink(modelName).should('be.visible').click();

      cy.step('Verify metrics dashboard is present');
      cy.url().should('include', '/metrics/');
      cy.url().should('include', projectName);
      cy.findByTestId('app-page-title').should('contain', 'metrics');

      cy.step('Wait for metrics page to load');
      cy.findByTestId('performance-metrics-loaded', { timeout: 30000 }).should('exist');

      cy.step('Verify metrics content - no error or disabled state');
      modelMetricsKserve.findKserveAreaDisabledCard().should('not.exist');
      modelMetricsKserve.findUnknownErrorCard().should('not.exist');
      modelMetricsKserve.findUnsupportedRuntimeCard().should('not.exist');

      cy.step('Verify at least one metrics chart/section is present');
      modelMetricsKserve.getAllMetricsCharts().should('have.length.at.least', 1);
    },
  );
});
