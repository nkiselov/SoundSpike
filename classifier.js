let tsvm

class Classifier{
    constructor(){
        this.vecs = []
        this.labels = []
        this.svm = new SVM({
            kernel: SVM.KERNEL_TYPES.RBF,
            type: SVM.SVM_TYPES.EPSILON_SVR,
            shrinking: false,
            tolerance: 0.01
        });
        this.trained = false
    }

    transcribe(vecs){
        if(!this.trained) return vecs.map(()=>0)
        return this.svm.predictProbability(vecs).map(pr=>pr.prediction)
    }

    addTrainData(vecs,labels){
        this.vecs.push(...vecs)
        this.labels.push(...labels)
    }

    learn(){
        this.svm.train(this.vecs,this.labels)
        this.trained = true
        tsvm = this
    }
}