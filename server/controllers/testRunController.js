const TestRun = require('../models/TestRun');
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middleware/auth');


// Get Test runs by Project Id
const getTestRunsByProjectId = async (req, res) =>{
    try{
        const {projectId} = req.query;
        const runs = await TestRun.find({project:projectId})
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name')
            .sort('-createdAt');
        
        if(!runs){
            return res.status(404).json({
                message: "No Testruns found!"
            });
        }

        res.status(200).json(runs);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


// Create test run
const createTestRuns = async (req, res) =>{
    try{
        const { name, description, project, suite, testCaseIds, assignedTo } = req.body;

        if(!name || !project){
            return res.status(400).json({
                message: "Please fill mandatory fields"
            });
        }

        const tcs = await TestCase.find({_id: {$in: testCaseIds}});
        const results = tcs.map(tc=>({testCase: tc._id, status: 'pending'}));
        const run = await TestRun.create({
            name,
            description,
            project,
            suite,
            assignedTo,
            results,
            createdBy: req.user._id,
            status: 'planned'
        });

        res.status(201).json(run);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// get Test run by id
const getTestRunById = async (req, res) =>{
    try{
        const {runId} = req.params.id;
        const run = await TestRun.findById(runId)
            .populate('createdy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('results.testCase', 'title priority steps')
            .populate('results.executedBy', 'name');
        if(!run){
            return res.status(404).json({
                message: "Testrun not found!"
            });
        }

        res.status(200).json(run);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Update a single result within a run
const updateTestRunById  = async (req, res) =>{
    try{
        const {status, notes, defectId} = req.body;
        const run = await TestRun.findById(req.params.id);
        const result = run.results.id(req.params.resultId);
        if(!result){
            return res.status(404).json({
                message: "Result not found!"
            });
        }
        result.status = status;
        result.notes = notes;
        result.defectId = defectId;
        result.executedAt = new Date();
        result.executedBy = req.user._id;

        // Auto-update run status
        const allDone = run.results.every(r=>r.status !== 'pending');
        if(allDone && run.status === 'in_progress'){
            run.status = 'completed';
            run.completedAt = new Date();
        }else if(run.status === 'planned'){
            run.status = 'in_progress';
            run.startedAt = new Date();
        }

        await run.save();
        res.status(200).json(run);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


// Update status by id
const updateStatus = async (req, res) =>{
    try{
        const {runId} = req.params.id;
        const run = await TestRun.findByIdAndUpdate(runId, {status: req.body.status}, {new: true});
        if(!run){
            return res.status(404).json({
                message: "Test run not found!"
            });
        }

        res.status(200).json(run);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Delete test run by Id
const deleteTestRunById = async (req, res) =>{
    try{
        const {runId} = req.params.id;
        await TestRun.findByIdAndDelete(runId);
        res.status(204).json({
            message: "Test run deleted!"
        });
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }

}

module.exports = {getTestRunsByProjectId, createTestRuns, getTestRunById, updateTestRunById, updateStatus, deleteTestRunById};