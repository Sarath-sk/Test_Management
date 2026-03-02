const TestSuite = require('../models/TestSuite');

// Get the list of suites by project Id
const getSuitesByProjectId = async (req, res) =>{
    try{
        const {projectId} = req.query;
        if(!projectId){
            return res.status(400).json({
                message: "Project Id is required"
            });
        }

        const suites = await TestSuite.find({ project:projectId })
            .populate('createdBy', 'name')
            .sort({ order: 1, name: 1});
        
        if(!suites){
            return res.status(404).json({
                message: "No Suites found!"
            })
        };

        res.status(200).json(suites);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Create test suites
const createTestSuites = async (req, res) =>{
    try{
        const {name, project} = req.body;
        if(!name || !project){
            return res.status(400).json({
                message: "Please fill mandatory fields!"
            });
        }

        if(!['admin', 'manager'].includes(req.user.role)){
            return res.status(403).json({
                message: "Insufficient permissions"
            });
        }

        const suite = await TestSuite.create({...req.body, createdBy: req.user._id});

        res.status(201).json(suite);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


// Update suite by suite id
const updateSuiteById = async (req, res) =>{
    try{
        const {suiteId} = req.params.id;
        if(!['admin', 'manager'].includes(req.user.role)){
            return res.status(400).json({
                message: "Insufficient permissions"
            });
        }

        const suite = await TestSuite.findByIdAndUpdate(suiteId, req.body, {new: true});
        if(!suite){
            return res.status(404).json({
                message: "Suite not found!"
            });
        }

        res.status(200).json(suite);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


// Delete suite by id
const deleteSuiteById = async (req, res) =>{
    try{
        const {suiteId} = req.params.id;

        if(!['admin', 'manager'].includes(req.user.role)){
            return res.status(400).json({
                message: "Insufficient permissions"
            });
        }

        await TestSuite.findByIdAndDelete(suiteId);

        res.status(204).json({
            message: "Suite deleted!"
        });

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


module.exports = {getSuitesByProjectId, createTestSuites, updateSuiteById, deleteSuiteById};